import { useMemo, useState } from 'react';
import { useSimulatedPC } from '../context/SimulatedPCContext';
import { AppFrame } from '../components/AppFrame';
import { EvidenceViewer } from '../components/EvidenceViewer';
import { FileText, Lock, AlertCircle, FileImage, Hexagon, Activity } from 'lucide-react';
import type { CaseChoice, CaseContent, FileItem, EvidenceItem, ScoringEvent } from '../types';

const kindIcons = {
  text: FileText,
  hex: Hexagon,
  packets: Activity,
  image: FileImage,
} as const;

export function CaseApp() {
  const { environment, addScoringEvent, completeSession, startShutdown } = useSimulatedPC();
  if (!environment) return null;
  const caseData = environment.content.case as CaseContent | undefined;
  if (!caseData) return null;

  const [currentSceneId, setCurrentSceneId] = useState(caseData.initialSceneId);
  const [viewedEvidence, setViewedEvidence] = useState<Set<string>>(new Set());
  const [openFileId, setOpenFileId] = useState<string | null>(null);
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const scene = caseData.scenes[currentSceneId];
  const evidenceFiles = caseData.evidence.files ?? [];
  const evidenceItems = caseData.evidence.items ?? [];

  const isUnlocked = useMemo(() => {
    if (!scene?.requiredEvidence || scene.requiredEvidence.length === 0) return true;
    return scene.requiredEvidence.every((id) => viewedEvidence.has(id));
  }, [scene, viewedEvidence]);

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
    if (choice.next === '__end') {
      completeSession();
      startShutdown();
      return;
    }
    if (choice.next) {
      setCurrentSceneId(choice.next);
    }
  };

  const openFile = (file: FileItem) => {
    setOpenFileId(file.id);
    setOpenItemId(null);
    setViewedEvidence((prev) => new Set([...prev, file.id]));
  };

  const openItem = (item: EvidenceItem) => {
    setOpenItemId(item.id);
    setOpenFileId(null);
    setViewedEvidence((prev) => new Set([...prev, item.id]));
  };

  const activeFile = evidenceFiles.find((f) => f.id === openFileId);
  const activeItem = evidenceItems.find((i) => i.id === openItemId);

  if (!scene) return null;

  return (
    <AppFrame title={environment.title} instructions={environment.briefing}>
      <div className="grid h-full grid-cols-1 gap-4 overflow-auto p-4 lg:grid-cols-3 lg:overflow-hidden">
        <div className="plate col-span-1 flex h-full flex-col gap-4 overflow-hidden p-4 sm:p-5 lg:col-span-2">
          <div className="flex-1 overflow-auto border border-hairline bg-stock-drift p-4 sm:p-5">
            {scene.speaker && (
              <p className="register mb-2 !text-seal-ink">
                {scene.speaker}
              </p>
            )}
            <p className="whitespace-pre-wrap text-base leading-relaxed text-ink sm:text-lg">
              {scene.narrative}
            </p>
            {!isUnlocked && scene.requiredEvidence && (
              <div className="mt-6 flex items-center border border-hairline border-l-2 border-l-strike bg-stock p-3 text-ink-soft">
                <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0 text-strike" />
                <p className="text-sm">
                  View the required evidence to unlock the next choices: {scene.requiredEvidence.join(', ')}
                </p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {scene.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => choose(choice)}
                disabled={!isUnlocked}
                className={`flex min-h-[44px] w-full items-center justify-between border px-4 py-3 text-left font-medium transition-colors ${
                  isUnlocked
                    ? 'border-ink bg-stock text-ink hover:bg-ink hover:text-stock'
                    : 'cursor-not-allowed border-hairline bg-stock-drift text-ink-soft'
                }`}
              >
                <span>{choice.text}</span>
                {!isUnlocked && <Lock className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>

        <div className="plate col-span-1 flex h-full flex-col gap-4 overflow-hidden p-4 sm:p-5">
          <h3 className="register flex items-center !text-ink">
            <FileText className="mr-2 h-5 w-5" /> Evidence
          </h3>
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
              <pre className="h-full overflow-auto whitespace-pre-wrap text-sm text-ink-soft">
                {activeFile.content}
              </pre>
            </div>
          )}
          {activeItem && (
            <div className="flex-1 overflow-hidden">
              <EvidenceViewer item={activeItem} />
            </div>
          )}
        </div>
      </div>
    </AppFrame>
  );
}
