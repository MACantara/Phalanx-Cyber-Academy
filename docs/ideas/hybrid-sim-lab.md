# Hybrid Sim-Lab: Case Stories + Skill Sandboxes

## Problem Statement

How might we rebuild the hands-on simulation environment so learners from high school through professional can practice cybersecurity decision-making and granular skills in a way that produces measurable learning, without creating an unmanageable content burden?

## Recommended Direction

Build a new simulation engine with two content types that share the same rendering and scoring layer:

1. **Case Stories**: short, branching cybersecurity incidents presented as interactive narratives. Learners investigate by opening apps, reading files/emails/logs, talking to simulated characters, and making decisions at critical moments. Outcomes and score depend on the quality of their choices, not just whether they clicked the right button.

2. **Skill Sandboxes**: focused, single-purpose practice environments for one concept at a time (e.g., identify phishing emails, configure a firewall rule, read suspicious network traffic). Each sandbox is short, repeatable, and gives immediate feedback.

Both content types feed into the same **adaptive replay** mechanism: after a successful or failed attempt, the engine regenerates the scenario with varied details (different sender, different IOC, different topology) to test whether the learner has generalized the skill or simply memorized the level.

The existing SimulatedPC desktop becomes **one possible rendering target** for case stories; skill sandboxes are lighter, standalone components. The goal is a flexible content engine where adding a new lesson means writing data and questions, not a new React component.

## Key Assumptions to Validate

- [ ] Learners will engage more with short branching stories than with a full simulated OS. *How to test:* A/B one rewritten case story against the existing SimulatedPC LevelOne for completion rate and time-on-task.
- [ ] Skill sandboxes are better than one big desktop for teaching mechanics like firewall rules or log analysis. *How to test:* Build one sandbox (e.g., email-phishing detection), run a small cohort, and compare pre/post scores on that topic.
- [ ] Adaptive replay (same task, different surface details) actually improves measured learning. *How to test:* Track pass rates on original vs. replayed variants and compare against a control group that does not get replay.
- [ ] Content creators can write cases and sandboxes as data without writing React code. *How to test:* Have a non-engineer author one scenario using the proposed data format.

## MVP Scope

### In

- One **Case Story** rebuilt from existing **Level 3: Malware Mayhem** as data-driven, branching incident-response narrative.
- One **Skill Sandbox** rebuilt from existing **Level 2: Email Phishing** as a focused email-classification sandbox.
- An **adaptive replay** loop for the email sandbox that re-runs with different email contents.
- A shared scoring and feedback system that reports score + time + decisions to the existing backend session endpoint.
- A unified data schema for cases and sandboxes so the platform can load either from the same `LevelData` type.

### Not Doing (and Why)

- **No full author UI yet.** Authoring happens as JSON/markdown for the MVP; a visual scenario builder is Phase 2. *Reason:* Validating content format comes before building the editor.
- **No 3D, terminal realism, or VM-style sandboxing.** The browser remains the sandbox. *Reason:* Adds hosting/complexity cost without improving measured learning.
- **No multiplayer, leaderboards, or competitive CTF modes for this phase.** *Reason:* Social features can wait until core learning mechanics are validated.
- **No support for live network or real malware analysis.** *Reason:* Scope and safety; the simulation remains abstract.
- **Do not restructure the whole legacy `app/` directory.** The rewrite lives in `frontend/` and `backend/app/`. *Reason:* Keep legacy runnable for reference per project rules.

## Schema Design

### Principles

1. **Discriminated `content` union.** The `LevelData.content` field is no longer an opaque object. A `content.type` field decides which renderer and which score calculation are used.
2. **Extend, don’t replace.** New content types can be added later as new union members without touching existing ones.
3. **Same scoring surface.** Every content type carries a `scoring` section so the `SimulatedPC` shell and backend `sessions/end` endpoint get the same payload shape regardless of what ran.
4. **Backend validation.** Content is loaded from `backend/app/data/level_content/level_{id}/data.json` and should be validated with Pydantic on the way out.

### Top-level `LevelData`

```typescript
interface LevelData {
  id: number;
  name: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xp_reward: number;
  session_id?: string;
  content: SimulationContent;
}

type SimulationContent =
  | CaseStoryContent
  | EmailSandboxContent
  | TerminalCtfContent
  | ArticleSandboxContent; // for migrating LevelOne
```

### Common shapes

```typescript
interface ScoringRules {
  maxScore: number;
  passingScore: number;
  // Each content type defines how it contributes points.
  rubric: RubricItem[];
}

interface RubricItem {
  id: string;
  label: string;
  maxPoints: number;
}

interface AdaptiveConfig {
  enabled: boolean;
  // Templates for regenerating surface details without changing the underlying skill.
  variants?: VariantTemplate[];
}

interface VariantTemplate {
  field: string;          // e.g., "sender", "domain", "ipAddress"
  pool: string[];         // alternate values
}
```

### Content type 1: `case-story`

```typescript
interface CaseStoryContent {
  type: 'case-story';
  version: string;
  title: string;
  instructions?: string;
  scoring: ScoringRules;
  adaptive?: AdaptiveConfig;
  initialSceneId: string;
  scenes: Record<string, CaseScene>;
  // Evidence is what the learner can inspect inside the simulated desktop.
  evidence: CaseEvidence;
}

interface CaseScene {
  id: string;
  narrative: string;
  speaker?: string;
  choices: CaseChoice[];
  // Evidence the learner must have viewed before choices unlock.
  requiredEvidence?: string[];
}

interface CaseChoice {
  id: string;
  text: string;
  score: number;
  feedback?: string;
  // Scene id to jump to, or "__end" to finish.
  next?: string;
}

interface CaseEvidence {
  emails?: EmailItem[];
  files?: FileItem[];
  terminal?: TerminalCommand[];
  network?: NetworkEvent[];
}
```

### Content type 2: `email-sandbox`

```typescript
interface EmailSandboxContent {
  type: 'email-sandbox';
  version: string;
  title: string;
  instructions?: string;
  scoring: ScoringRules;
  adaptive?: AdaptiveConfig;
  emails: EmailItem[];
}

interface EmailItem {
  id: string;
  from: string;
  subject: string;
  body: string;
  isPhishing: boolean;
  redFlags?: string[];
  explanation?: string;
}
```

### Migration of existing levels

- `LevelOne` (article real/fake) → `ArticleSandboxContent`.
- `LevelTwo` (email phishing) → `EmailSandboxContent`.
- `LevelThree`–`LevelFive` (desktop CTF) → `TerminalCtfContent`.

For the MVP, only `case-story` and `email-sandbox` are implemented; `terminal-ctf` and `article-sandbox` types are declared so existing data can be typed but not yet rewritten.

## Engine Refactor Sketch

### Current state

- `SimulatedPC` owns boot, desktop, shutdown, and window management.
- `Desktop` looks up the level component by `level.id` via `getLevelComponent(level.id)`.
- Each `LevelOne`…`LevelFive` is a hand-written React component that reaches into `content.data` and `content.dialogues` by shape.
- `appRegistry` defines the apps; `LevelComponent` either embeds an app directly or is the app itself.

### Target architecture

```
SimulatedPC
├── Shell: boot, shutdown, score reporting, session timing
├── Engine
│   ├── content.type === 'case-story'     → CaseStoryRenderer (uses Desktop)
│   ├── content.type === 'email-sandbox'  → EmailSandboxRenderer (focused)
│   ├── content.type === 'terminal-ctf'   → TerminalCtfRenderer (uses Desktop)
│   └── content.type === 'article-sandbox'→ ArticleSandboxRenderer (focused)
├── ScoringOrchestrator
│   ├── consumes scoring.rubric
│   ├── receives scoring events from renderers
│   ├── computes final score
│   └── calls completeSession(score)
└── AdaptiveEngine
    ├── receives adaptive.variants
    ├── mutates surface fields on replay
    └── returns a new content object to the renderer
```

### Content → renderer mapping

Replace `getLevelComponent(level.id)` with a type-based registry:

```typescript
const rendererRegistry: Record<
  SimulationContent['type'],
  React.ComponentType<{ content: SimulationContent }>
> = {
  'case-story': CaseStoryRenderer,
  'email-sandbox': EmailSandboxRenderer,
  'terminal-ctf': TerminalCtfRenderer,
  'article-sandbox': ArticleSandboxRenderer,
};

function getRenderer(type: SimulationContent['type']) {
  return rendererRegistry[type] ?? LegacyRenderer;
}
```

`LegacyRenderer` keeps the old `getLevelComponent(level.id)` behavior for content that has not yet been migrated.

### Case story renderer

```typescript
function CaseStoryRenderer({ content }: { content: CaseStoryContent }) {
  const [sceneId, setSceneId] = useState(content.initialSceneId);
  const [viewedEvidence, setViewedEvidence] = useState<Set<string>>(new Set());
  const [madeChoices, setMadeChoices] = useState<Record<string, string>>({});

  const scene = content.scenes[sceneId];
  const canChoose =
    !scene.requiredEvidence ||
    scene.requiredEvidence.every((id) => viewedEvidence.has(id));

  return (
    <Desktop>
      <ScenePanel scene={scene} />
      <ChoicePanel scene={scene} disabled={!canChoose} onChoose={handleChoice} />
    </Desktop>
  );
}
```

- `ScenePanel` renders the narrative text and speaker.
- `ChoicePanel` lists `scene.choices` and only enables them when the learner has viewed the required evidence.
- Evidence is opened through the existing `appRegistry` (`EmailApp`, `FilesApp`, `BrowserApp`, `TerminalApp`), now driven by `content.evidence` instead of hard-coded props.
- Choosing a `__end` choice computes score from `scoring.rubric` and calls `completeSession`.

### Email sandbox renderer

```typescript
function EmailSandboxRenderer({ content }: { content: EmailSandboxContent }) {
  const [answers, setAnswers] = useState<Record<string, 'phishing' | 'legitimate'>>({});

  const correct = content.emails.filter(
    (e) => (e.isPhishing ? 'phishing' : 'legitimate') === answers[e.id]
  ).length;

  const score = Math.round((correct / content.emails.length) * content.scoring.maxScore);

  return (
    <FocusedSandboxLayout title={content.title} instructions={content.instructions}>
      <EmailList emails={content.emails} answers={answers} onAnswer={setAnswers} />
    </FocusedSandboxLayout>
  );
}
```

- No desktop chrome. One focused task.
- Reuses `EmailItem` shape and can evolve into a data-driven `EmailApp`.
- Adaptive replay swaps `from`, `subject`, `body` from `adaptive.variants` pool.

### Scoring orchestrator

```typescript
interface ScoringState {
  rubric: RubricItem[];
  events: ScoringEvent[];
}

type ScoringEvent =
  | { type: 'choice'; choiceId: string; sceneId: string; score: number }
  | { type: 'flag-captured'; flagId: string; points: number }
  | { type: 'email-classified'; emailId: string; correct: boolean };

function computeScore(scoring: ScoringState): number {
  return scoring.events.reduce((sum, e) => sum + (e.score ?? e.points ?? (e.correct ? 1 : 0)), 0);
}
```

- Each renderer emits `ScoringEvent`s.
- `SimulatedPC` feeds them to `ScoringOrchestrator` and passes the computed score to `onComplete`.
- The backend `sessions/end` endpoint already expects `{ score: number }`, so no API change.

### Adaptive replay

```typescript
function applyAdaptive(content: SimulationContent, variants: VariantTemplate[]): SimulationContent {
  // Simple first pass: pick one value from each variant pool and substitute.
  const mutated = structuredClone(content);
  for (const v of variants ?? []) {
    const value = v.pool[Math.floor(Math.random() * v.pool.length)];
    set(mutated, v.field, value);
  }
  return mutated;
}
```

- `set` is a path-based setter (e.g., `set(mutated, 'emails.0.from', 'IT-Support')`).
- The engine re-runs the current `level` with the mutated `content` for replay.
- Kept out of MVP for `case-story`; implemented for `email-sandbox` first.

### Files to touch (for awareness, not now)

- `frontend/src/features/simulated-pc/types.ts`
- `frontend/src/features/simulated-pc/SimulatedPC.tsx`
- `frontend/src/features/simulated-pc/components/Desktop.tsx`
- `frontend/src/features/simulated-pc/renderers/*.tsx` (new)
- `frontend/src/features/simulated-pc/apps/*.tsx` (make data-driven)
- `backend/app/data/level_content/level_{id}/data.json` (migrated)

## Open Questions

- *(none remaining for MVP design)*

## Locked Decisions

- **First case story:** Level 3: Malware Mayhem.
- **First skill sandbox:** Level 2: Email Phishing.
- **Sandbox placement:** Separate lesson nodes on the dashboard; no embedded tools in case stories for MVP.
- **Legacy compatibility:** New engine keeps a `LegacyRenderer` that falls back to `getLevelComponent(level.id)` for unmigrated levels.
- **Backend content files:** One unified `data.json` per level for the new format; legacy split files stay for unmigrated levels.
