import { useMemo, useState } from 'react';
import { useSimulatedPC } from '../context/SimulatedPCContext';
import { FocusedSandboxLayout } from '../components/FocusedSandboxLayout';
import { EvidenceViewer } from '../components/EvidenceViewer';
import { FileText, Lock, AlertCircle, CheckCircle, FileImage, Hexagon, Activity } from 'lucide-react';
import type { CaseStoryContent, CaseChoice, FileItem, EvidenceItem, ScoringEvent } from '../types';

const kindIcons = {
  text: FileText,
  hex: Hexagon,
  packets: Activity,
  image: FileImage,
} as const;

export function CaseStoryRenderer() {
  const { content, addScoringEvent, completeSession, startShutdown } = useSimulatedPC();
  if (!content || content.type !== 'case-story') return null;
  const caseContent = content as CaseStoryContent;

  const [currentSceneId, setCurrentSceneId] = useState(caseContent.initialSceneId);
  const [viewedEvidence, setViewedEvidence] = useState<Set<string>>(new Set());
  const [openFileId, setOpenFileId] = useState<string | null>(null);
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const scene = caseContent.scenes[currentSceneId];
  const evidenceFiles = caseContent.evidence.files ?? [];
  const evidenceItems = caseContent.evidence.items ?? [];

  const isUnlocked = useMemo(() => {
    if (!scene?.requiredEvidence || scene.requiredEvidence.length === 0) return true;
    return scene.requiredEvidence.every((id) => viewedEvidence.has(id));
  }, [scene, viewedEvidence]);

  const choose = (choice: CaseChoice) => {
    const event: ScoringEvent = { type: 'choice', id: choice.id, points: choice.score };
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
    <FocusedSandboxLayout title={caseContent.title} instructions={caseContent.instructions}>
      <div className="grid h-full grid-cols-1 gap-4 p-4 lg:grid-cols-3">
        <div className="col-span-1 flex h-full flex-col gap-4 overflow-hidden rounded-xl bg-slate-800 p-5 lg:col-span-2">
          <div className="flex-1 overflow-auto rounded-lg bg-slate-900 p-5">
            {scene.speaker && (
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-400">
                {scene.speaker}
              </p>
            )}
            <p className="whitespace-pre-wrap text-lg leading-relaxed text-slate-100">
              {scene.narrative}
            </p>
            {!isUnlocked && scene.requiredEvidence && (
              <div className="mt-6 flex items-center rounded-lg bg-amber-900/40 p-3 text-amber-200">
                <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
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
                className={`flex w-full items-center justify-between rounded-lg border border-slate-600 px-4 py-3 text-left font-medium transition-colors ${
                  isUnlocked
                    ? 'bg-slate-700 text-white hover:bg-blue-600'
                    : 'cursor-not-allowed bg-slate-800 text-slate-500'
                }`}
              >
                <span>{choice.text}</span>
                {!isUnlocked && <Lock className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-1 flex h-full flex-col gap-4 overflow-hidden rounded-xl bg-slate-800 p-5">
          <h3 className="flex items-center text-lg font-bold text-white">
            <FileText className="mr-2 h-5 w-5" /> Evidence
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {evidenceFiles.map((file) => {
              const viewed = viewedEvidence.has(file.id);
              return (
                <button
                  key={file.id}
                  onClick={() => openFile(file)}
                  className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center text-sm transition-colors ${
                    openFileId === file.id
                      ? 'border-blue-500 bg-blue-900/30 text-blue-100'
                      : 'border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  <FileText className="mb-1 h-6 w-6" />
                  <span className="break-words text-xs">{file.name}</span>
                  {viewed && <CheckCircle className="mt-1 h-3 w-3 text-green-400" />}
                </button>
              );
            })}
            {evidenceItems.map((item) => {
              const viewed = viewedEvidence.has(item.id);
              const Icon = kindIcons[item.kind] ?? FileText;
              return (
                <button
                  key={item.id}
                  onClick={() => openItem(item)}
                  className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center text-sm transition-colors ${
                    openItemId === item.id
                      ? 'border-blue-500 bg-blue-900/30 text-blue-100'
                      : 'border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  <Icon className="mb-1 h-6 w-6" />
                  <span className="break-words text-xs">{item.title}</span>
                  {viewed && <CheckCircle className="mt-1 h-3 w-3 text-green-400" />}
                </button>
              );
            })}
          </div>
          {activeFile && (
            <div className="flex-1 overflow-hidden rounded-lg border border-slate-600 bg-slate-900 p-4">
              <p className="mb-2 text-sm font-semibold text-slate-300">{activeFile.name}</p>
              <pre className="h-full overflow-auto whitespace-pre-wrap text-sm text-slate-300">
                {activeFile.content}
              </pre>
            </div>
          )}
          {activeItem && (
            <div className="flex-1 overflow-hidden rounded-lg border border-slate-600 bg-slate-900 p-0">
              <EvidenceViewer item={activeItem} />
            </div>
          )}
        </div>
      </div>
    </FocusedSandboxLayout>
  );
}
