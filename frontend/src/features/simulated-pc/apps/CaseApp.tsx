import { useMemo, useState } from 'react';
import { useSimulatedPC } from '../context/SimulatedPCContext';
import { AppFrame } from '../components/AppFrame';
import { EvidenceViewer } from '../components/EvidenceViewer';
import { SpeakerChip } from '../components/SpeakerChip';
import { CitePrompt } from '../components/exercise/CitePrompt';
import { FileText, Lock, AlertCircle, FileImage, Hexagon, Activity, ListOrdered, RotateCcw } from 'lucide-react';
import type { CaseChoice, CaseContent, FileItem, EvidenceItem, ScoringEvent } from '../types';
import { cn } from '@/lib/utils';

const kindIcons = {
  text: FileText,
  hex: Hexagon,
  packets: Activity,
  image: FileImage,
} as const;

interface ArmedCite {
  choiceId: string;
  evidenceId: string;
  match?: string;
}

export function CaseApp() {
  const { environment, addScoringEvent, emit, completeSession, startShutdown } = useSimulatedPC();
  if (!environment) return null;
  const caseData = environment.content.case as CaseContent | undefined;
  if (!caseData) return null;

  const [currentSceneId, setCurrentSceneId] = useState(caseData.initialSceneId);
  const [viewedEvidence, setViewedEvidence] = useState<Set<string>>(new Set());
  const [openFileId, setOpenFileId] = useState<string | null>(null);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [cited, setCited] = useState<Set<string>>(new Set());
  const [armedCite, setArmedCite] = useState<ArmedCite | null>(null);
  const [citeMiss, setCiteMiss] = useState(false);
  const [sequenceSolved, setSequenceSolved] = useState<Set<string>>(new Set());
  const [placed, setPlaced] = useState<string[]>([]);
  const [sequenceAttempts, setSequenceAttempts] = useState(0);

  const scene = caseData.scenes[currentSceneId];
  const evidenceFiles = caseData.evidence.files ?? [];
  const evidenceItems = caseData.evidence.items ?? [];

  const isSequence = scene?.type === 'sequence' && !!scene.order;
  const sequenceDone = !isSequence || sequenceSolved.has(scene.id);

  const sceneGateOpen = useMemo(() => {
    if (!scene?.requiredEvidence || scene.requiredEvidence.length === 0) return true;
    return scene.requiredEvidence.every((id) => viewedEvidence.has(id));
  }, [scene, viewedEvidence]);

  const evidenceTitle = (id: string) =>
    evidenceFiles.find((f) => f.id === id)?.name ??
    evidenceItems.find((i) => i.id === id)?.title ??
    id;

  const choiceUnlocked = (choice: CaseChoice) =>
    sceneGateOpen && sequenceDone && (!choice.requiresCite || cited.has(choice.id));

  const choose = (choice: CaseChoice) => {
    const event: ScoringEvent = {
      type: 'choice',
      id: choice.id,
      points: choice.score,
      app: 'case',
      action: 'choice',
      target: choice.id,
    };
    addScoringEvent(event);
    emit({ app: 'case', action: 'choice', target: choice.id });
    if (choice.next === '__end') {
      completeSession();
      startShutdown();
      return;
    }
    if (choice.next) {
      setPlaced([]);
      setSequenceAttempts(0);
      setArmedCite(null);
      setCurrentSceneId(choice.next);
    }
  };

  const armCite = (choice: CaseChoice) => {
    if (!choice.requiresCite) return;
    const { evidenceId, match } = choice.requiresCite;
    setArmedCite({ choiceId: choice.id, evidenceId, match });
    setCiteMiss(false);
    const file = evidenceFiles.find((f) => f.id === evidenceId);
    const item = evidenceItems.find((i) => i.id === evidenceId);
    if (file) openFile(file);
    else if (item) openItem(item);
  };

  const onCite = (line: string) => {
    if (!armedCite) return;
    const ok = !armedCite.match || line.includes(armedCite.match);
    if (ok) {
      setCited((prev) => new Set([...prev, armedCite.choiceId]));
      addScoringEvent({ type: 'cite', id: armedCite.choiceId, points: 5, app: 'case', action: 'cite', target: armedCite.evidenceId });
      emit({ app: 'case', action: 'cite', target: armedCite.evidenceId, data: { choiceId: armedCite.choiceId, correct: true } });
      setArmedCite(null);
      setCiteMiss(false);
    } else {
      emit({ app: 'case', action: 'cite', target: armedCite.evidenceId, data: { choiceId: armedCite.choiceId, correct: false } });
      setCiteMiss(true);
    }
  };

  const openFile = (file: FileItem) => {
    setOpenFileId(file.id);
    setOpenItemId(null);
    setViewedEvidence((prev) => new Set([...prev, file.id]));
    emit({ app: 'case', action: 'view', target: file.id });
  };

  const openItem = (item: EvidenceItem) => {
    setOpenItemId(item.id);
    setOpenFileId(null);
    setViewedEvidence((prev) => new Set([...prev, item.id]));
    emit({ app: 'case', action: 'view', target: item.id });
  };

  const activeFile = evidenceFiles.find((f) => f.id === openFileId);
  const activeItem = evidenceItems.find((i) => i.id === openItemId);
  const citeForOpen = (id: string) =>
    armedCite && armedCite.evidenceId === id
      ? { match: armedCite.match, onCite }
      : null;

  const submitSequence = () => {
    if (!scene?.order || placed.length !== scene.order.steps.length) return;
    const hits = scene.order.steps.filter((s, i) => placed[i] === s).length;
    const acc = hits / scene.order.steps.length;
    const attempt = sequenceAttempts + 1;
    setSequenceAttempts(attempt);
    emit({ app: 'case', action: 'sequence', target: scene.id, data: { acc, attempt, correct: acc === 1 } });
    if (acc === 1) {
      // First-pass solve pays full marks; retries after a miss pay half.
      addScoringEvent({
        type: 'sequence',
        id: scene.id,
        points: attempt === 1 ? 10 : 5,
        app: 'case',
        action: 'sequence',
        target: scene.id,
      });
      setSequenceSolved((prev) => new Set([...prev, scene.id]));
    } else {
      setPlaced([]);
    }
  };

  if (!scene) return null;

  return (
    <AppFrame title={environment.title} instructions={environment.briefing}>
      <div className="grid h-full grid-cols-1 gap-4 overflow-auto p-4 lg:grid-cols-3 lg:overflow-hidden">
        <div className="plate col-span-1 flex h-full flex-col gap-4 overflow-hidden p-4 sm:p-5 lg:col-span-2">
          <div className="flex-1 overflow-auto border border-hairline bg-stock-drift p-4 sm:p-5">
            {scene.speaker && (
              <div className="mb-3">
                <SpeakerChip speaker={scene.speaker} />
              </div>
            )}
            <p className="whitespace-pre-wrap text-base leading-relaxed text-ink sm:text-lg">
              {scene.narrative}
            </p>
            {!sceneGateOpen && scene.requiredEvidence && (
              <div className="mt-6 flex items-center border border-hairline border-l-2 border-l-strike bg-stock p-3 text-ink-soft">
                <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0 text-strike" />
                <p className="text-sm">
                  View the required evidence to unlock the next choices: {scene.requiredEvidence.join(', ')}
                </p>
              </div>
            )}
          </div>

          {isSequence && !sequenceDone && scene.order && (
            <div className="space-y-2 border border-hairline bg-stock-drift p-3">
              <p className="register flex items-center"><ListOrdered className="mr-2 h-4 w-4" /> Order the record</p>
              <div className="flex flex-wrap gap-2">
                {scene.order.items.map((label) => {
                  const used = placed.includes(label);
                  return (
                    <button
                      key={label}
                      disabled={used}
                      onClick={() => setPlaced((p) => [...p, label])}
                      className="min-h-[44px] border border-ink bg-stock px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-ink transition-colors hover:bg-seal hover:text-seal-ink disabled:opacity-30"
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <div className="space-y-1">
                {scene.order.steps.map((_, i) => (
                  <button
                    key={i}
                    disabled={!placed[i]}
                    onClick={() => setPlaced((p) => p.filter((_, j) => j !== i))}
                    className={cn(
                      'flex min-h-[44px] w-full items-center gap-3 border px-3 py-2 text-left font-mono text-[11px] uppercase tracking-[0.1em]',
                      placed[i] ? 'border-ink bg-seal text-seal-ink' : 'border-dashed border-hairline text-ink-soft'
                    )}
                  >
                    <span className="plate-id">{i + 1}</span>
                    {placed[i] ?? 'Tap an item to place it'}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={submitSequence}
                  disabled={placed.length !== scene.order.steps.length}
                  className="min-h-[44px] flex-1 bg-ink px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal hover:text-seal-ink disabled:opacity-50"
                >
                  Certify order
                </button>
                <button
                  onClick={() => setPlaced([])}
                  className="flex min-h-[44px] items-center border border-ink px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink hover:bg-stock-green"
                >
                  <RotateCcw className="mr-1 h-4 w-4" /> Reset
                </button>
              </div>
              {sequenceAttempts > 0 && (
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-strike">
                  Order rejected — re-examine the exhibits and rebuild
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            {scene.choices.map((choice) => {
              const unlocked = choiceUnlocked(choice);
              const needsCite = !!choice.requiresCite && !cited.has(choice.id);
              return (
                <div key={choice.id} className="space-y-1">
                  {needsCite && sceneGateOpen && sequenceDone && (
                    <CitePrompt
                      evidenceTitle={evidenceTitle(choice.requiresCite!.evidenceId)}
                      citing={armedCite?.choiceId === choice.id}
                      done={cited.has(choice.id)}
                      onArm={() => armCite(choice)}
                    />
                  )}
                  <button
                    onClick={() => choose(choice)}
                    disabled={!unlocked}
                    className={`flex min-h-[44px] w-full items-center justify-between border px-4 py-3 text-left font-medium transition-colors ${
                      unlocked
                        ? 'border-ink bg-stock text-ink hover:bg-ink hover:text-stock'
                        : 'cursor-not-allowed border-hairline bg-stock-drift text-ink-soft'
                    }`}
                  >
                    <span>{choice.text}</span>
                    {!unlocked && <Lock className="h-4 w-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="plate col-span-1 flex h-full flex-col gap-4 overflow-hidden p-4 sm:p-5">
          <h3 className="register flex items-center !text-ink">
            <FileText className="mr-2 h-5 w-5" /> Evidence
          </h3>
          {citeMiss && (
            <p className="border border-strike bg-strike/10 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-strike">
              Not the proving line — cite again
            </p>
          )}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {evidenceFiles.map((file, i) => {
              const viewed = viewedEvidence.has(file.id);
              return (
                <button
                  key={file.id}
                  onClick={() => openFile(file)}
                  className={`flex min-h-[64px] flex-col items-center justify-center border p-3 text-center text-sm transition-colors ${
                    openFileId === file.id
                      ? 'border-ink bg-seal text-seal-ink'
                      : 'border-hairline bg-stock text-ink-soft hover:border-ink hover:text-ink'
                  }`}
                >
                  <FileText className="mb-1 h-6 w-6" />
                  <span className="break-words text-xs">{file.name}</span>
                  <span className="mt-1 font-mono text-[8px] tracking-[0.18em] text-ink-soft">
                    EXH-{String(i + 1).padStart(2, '0')}{viewed ? ' · ✓' : ''}
                  </span>
                </button>
              );
            })}
            {evidenceItems.map((item, i) => {
              const viewed = viewedEvidence.has(item.id);
              const Icon = kindIcons[item.kind] ?? FileText;
              return (
                <button
                  key={item.id}
                  onClick={() => openItem(item)}
                  className={`flex min-h-[64px] flex-col items-center justify-center border p-3 text-center text-sm transition-colors ${
                    openItemId === item.id
                      ? 'border-ink bg-seal text-seal-ink'
                      : 'border-hairline bg-stock text-ink-soft hover:border-ink hover:text-ink'
                  }`}
                >
                  <Icon className="mb-1 h-6 w-6" />
                  <span className="break-words text-xs">{item.title}</span>
                  <span className="mt-1 font-mono text-[8px] tracking-[0.18em] text-ink-soft">
                    EXH-{String(evidenceFiles.length + i + 1).padStart(2, '0')}{viewed ? ' · ✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>
          {activeFile && (
            <div className="flex-1 overflow-hidden border border-hairline bg-stock-drift p-4">
              <p className="register mb-2 !text-ink">{activeFile.name}</p>
              {citeForOpen(activeFile.id) ? (
                <div className="h-full overflow-auto">
                  {activeFile.content.split('\n').map((line, i) => (
                    <button
                      key={i}
                      onClick={() => onCite(line)}
                      className="block min-h-[32px] w-full whitespace-pre-wrap px-2 py-1 text-left font-mono text-xs text-ink-soft transition-colors hover:bg-seal/60"
                    >
                      {line || ' '}
                    </button>
                  ))}
                </div>
              ) : (
                <pre className="h-full overflow-auto whitespace-pre-wrap text-sm text-ink-soft">
                  {activeFile.content}
                </pre>
              )}
            </div>
          )}
          {activeItem && (
            <div className="flex-1 overflow-hidden">
              <EvidenceViewer item={activeItem} cite={citeForOpen(activeItem.id)} />
            </div>
          )}
        </div>
      </div>
    </AppFrame>
  );
}
