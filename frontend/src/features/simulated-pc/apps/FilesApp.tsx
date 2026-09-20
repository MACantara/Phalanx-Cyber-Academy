import { useState } from 'react';
import { useSimulatedPC } from '../context/SimulatedPCContext';
import { AppFrame } from '../components/AppFrame';
import { FileText, FolderOpen, Lock, FileCheck, CheckCircle, XCircle } from 'lucide-react';
import type { FileItem, FilesContent } from '../types';

export function FilesApp() {
  const { environment, emit, unlocked, addScoringEvent } = useSimulatedPC();
  const filesContent = environment?.content.files as FilesContent | undefined;
  const [openId, setOpenId] = useState<string | null>(null);
  const [taskAnswer, setTaskAnswer] = useState<{ fileId: string; correct: boolean } | null>(null);
  if (!environment) return null;

  // hidden = invisible until unlocked; locked = visible but sealed until unlocked
  const files = (filesContent?.files ?? []).filter((f) => !f.hidden || unlocked.has(f.id));
  const isLocked = (f: FileItem) => !!f.locked && !unlocked.has(f.id);
  const openFile = files.find((f) => f.id === openId);
  const task = filesContent?.task;
  const taskDone = taskAnswer?.correct === true;

  const open = (file: FileItem) => {
    if (isLocked(file)) return;
    setOpenId(file.id);
    emit({ app: 'files', action: 'open', target: file.id });
  };

  const fileAnswer = (file: FileItem) => {
    if (!task || taskDone) return;
    const correct = file.id === task.answerFileId;
    setTaskAnswer({ fileId: file.id, correct });
    if (correct) {
      addScoringEvent({ type: 'file-task', id: task.answerFileId, points: 10, app: 'files', action: 'answer', target: file.id });
    }
    emit({ app: 'files', action: 'answer', target: file.id, data: { correct } });
  };

  return (
    <AppFrame title={environment.title} instructions={environment.briefing}>
      <div className="flex h-full flex-col overflow-hidden lg:flex-row">
        <div className="flex max-h-56 shrink-0 flex-col overflow-hidden border-b border-hairline lg:max-h-none lg:w-64 lg:border-b-0 lg:border-r">
          <div className="register flex items-center border-b border-hairline bg-stock-drift px-3 py-2">
            <FolderOpen className="mr-2 h-4 w-4" /> Files ({files.length})
          </div>
          {task && (
            <div className={`border-b border-hairline px-3 py-2 ${taskDone ? 'bg-stock-green' : 'bg-stock-drift'}`}>
              <p className="register flex items-center !text-ink">
                <FileCheck className="mr-1.5 h-3.5 w-3.5" /> Assignment
              </p>
              <p className="mt-1 text-xs text-ink-soft">{task.prompt}</p>
              {taskAnswer && (
                <p className={`mt-1 flex items-center font-mono text-[9px] uppercase tracking-[0.12em] ${taskDone ? 'text-confirm' : 'text-strike'}`}>
                  {taskDone ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                  {taskDone ? 'Filed correctly' : 'Wrong file — keep looking'}
                </p>
              )}
            </div>
          )}
          <div className="grid flex-1 grid-cols-2 gap-0 overflow-auto sm:grid-cols-3 lg:grid-cols-1">
            {files.map((file, i) => {
              const locked = isLocked(file);
              return (
                <button
                  key={file.id}
                  onClick={() => open(file)}
                  disabled={locked}
                  className={`flex min-h-[64px] flex-col items-center justify-center border-b border-r border-hairline p-3 text-center transition-colors lg:border-r-0 ${
                    openId === file.id
                      ? 'bg-seal text-seal-ink'
                      : locked
                        ? 'cursor-not-allowed bg-stock-drift text-ink-soft'
                        : 'bg-stock text-ink hover:bg-stock-green'
                  }`}
                >
                  {locked ? <Lock className="mb-1 h-5 w-5" /> : <FileText className="mb-1 h-5 w-5" />}
                  <span className="break-words text-xs">{file.name}</span>
                  <span className="mt-1 font-mono text-[8px] tracking-[0.18em] opacity-70">
                    FIL-{String(i + 1).padStart(2, '0')} · {locked ? 'Sealed' : file.path}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          {openFile ? (
            <>
              <div className="register flex items-center justify-between border-b border-hairline bg-stock-drift px-4 py-2">
                <span>{openFile.path}/{openFile.name}</span>
                {task && !taskDone && (
                  <button
                    onClick={() => fileAnswer(openFile)}
                    className="min-h-[44px] border border-ink px-4 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-seal hover:text-seal-ink"
                  >
                    File as answer
                  </button>
                )}
              </div>
              <pre className="flex-1 overflow-auto whitespace-pre-wrap p-4 text-sm leading-relaxed text-ink sm:p-5">
                {openFile.content}
              </pre>
              {taskAnswer?.fileId === openFile.id && !taskDone && task?.matchHint && (
                <p className="border-t border-hairline bg-stock-drift px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
                  Hint — look for: {task.matchHint}
                </p>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center p-6">
              <span className="register">Select a file to inspect</span>
            </div>
          )}
        </div>
      </div>
    </AppFrame>
  );
}
