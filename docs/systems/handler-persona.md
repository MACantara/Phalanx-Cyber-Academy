# Handler Persona System

How characters speak inside the simulated environment. One channel, every surface: content stores a **speaker key**, the registry resolves it to a persona, and `SpeakerChip` renders the avatar + name plate wherever the line appears.

## The model

```
speaker key ('instructor')
    → scenario.cast[key]        (level-defined, wins)
    → SPEAKERS[key] in lib/characters.ts  (platform registry)
    → bare label                (unknown key — free-text speaker still shows)
```

`SPEAKERS` maps **roles to personas**, not names to avatars. `instructor` is currently personified by Dr. Cipher platform-wide (`Cipher_Neutral_Talking.gif`, static frame `Cipher_Neutral.png` for `prefers-reduced-motion`). Persona fields:

| Field | Purpose |
|---|---|
| `name` | Display name on the chip |
| `role` | Mono tag under the name (`INSTRUCTOR`, `HANDLER`) |
| `avatar` | Image path, may animate |
| `avatarStatic` | Optional still frame used under reduced-motion |

## The four surfaces

| Surface | When it speaks | Content field |
|---|---|---|
| Briefing plate | Once per desktop entry; re-openable via COMMS | `scenario.briefing` |
| Scene narrative | Every scene render | `scene.speaker` (case-story levels) |
| Notification toast | When a trigger fires | `notify` effect with `speaker` |
| Report debrief | Session end | `scenario.debrief` |

**Briefing plate vs. scene:** briefing is shell-level framing — one transmission pointing the learner at the work. Scenes are decision-bound dialogue inside the case app. If the learner must *answer*, it belongs in a scene; if they only need *context*, it belongs in the briefing.

## Authoring

Works identically on legacy content types (`article-sandbox`, `email-sandbox`, `case-story` — the adapter merges a top-level `scenario` block) and `environment: true` levels (native `scenario`).

### `scenario.briefing`

```json
"scenario": {
  "briefing": {
    "speaker": "instructor",
    "messages": [
      { "text": "Opening line. Mission framing goes here." },
      { "text": "Second page.", "example": "Suspicious: 'paypaI.com'\nLegitimate: 'paypal.com'" }
    ]
  }
}
```

- `messages[]` pages in order; keep pages short and modular (one idea each).
- `example` renders as an inset reference block — use it for concrete worked examples, not flavor text.
- Inline formatting: `*emphasis*` and `` `code` `` spans are supported.

### `scenario.debrief`

```json
"debrief": { "speaker": "instructor", "text": "Check the sender domain before the message. Most lures fail there." }
```

One line. It renders on the environment `SessionReport` and on the Mail/Reader verdict screens. Case-story levels end on their `complete` scene instead — don't author `debrief` there.

### Speaker'd notifications

```json
"triggers": [
  {
    "on": { "app": "mail", "action": "classify", "data": { "correct": false } },
    "then": [{ "notify": { "text": "Verdict challenged. Recheck the sender domain.", "speaker": "instructor" } }]
  }
]
```

`notify` accepts a plain string (system toast, bell icon) or `{ "text", "speaker" }` (persona toast, speaker chip).

### `scenario.cast`

Level-defined characters without code changes:

```json
"cast": {
  "forensics": { "name": "Tech. Reyes", "role": "FORENSICS", "avatar": "/images/avatars/reyes.png" }
}
```

Add the avatar asset under `frontend/public/images/avatars/`. `avatarStatic` is optional — without it the avatar animates under reduced-motion too.

## Event vocabulary

What triggers can match (from app `emit()` calls):

| App | Actions | Data |
|---|---|---|
| `mail` | `open`, `classify`, `click-link` | `classify`: `{verdict, correct}` |
| `reader` | `classify` | `classify`: `{value, correct}` |
| `case` | `view` | target = evidence id |
| `files` | `open` | — |
| `browser` | `visit`, `submit` | `submit`: form values |

## Cadence rules

- **Remediation triggers** (wrong verdicts): no `once` — fire on every miss. Per-action feedback is the point.
- **Observation triggers** (key-evidence comments, first-open hints): `once: true`. A remark reads as a comment once and a broken recording twice.
- **Layered specificity:** a generic `correct:false` trigger can coexist with `target`-specific hints on the exhibits that need them.

## Content rules

- Keep messages short — the plate pages; it does not lecture. A briefing over ~10 pages is a smell.
- No fabricated statistics ("90% of breaches come from email") and no scoring explanations — the scoring UI owns numbers.
- The persona is seasoning, not scaffolding: guidance earns its place when it teaches a check, names a consequence, or marks a decision. Encouragement alone is filler.
- Avatars are 2D and text-on-screen by design — that is the configuration the learning evidence supports, not a limitation.
