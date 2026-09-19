import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { DialogueMessage } from '../types';
import { ChevronLeft, ChevronRight, Lightbulb, SkipForward } from 'lucide-react';

const CHARACTER_AVATARS: Record<string, string> = {
  instructor: '/images/avatars/Cipher_Neutral_Talking.gif',
  default: '/images/avatars/default.png',
};

const CHARACTER_NAMES: Record<string, string> = {
  instructor: 'Dr. Cipher',
  default: 'System',
};

function parseInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /(?<!\*)\*([^*]+)\*(?!\*)|`([^`]+)`/g;
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <span key={`${keyPrefix}-${key++}`}>{text.slice(lastIndex, match.index)}</span>
      );
    }
    if (match[1] !== undefined) {
      nodes.push(
        <em key={`${keyPrefix}-${key++}`} className="italic text-seal-ink">
          {match[1]}
        </em>
      );
    } else if (match[2] !== undefined) {
      nodes.push(
        <code
          key={`${keyPrefix}-${key++}`}
          className="border border-hairline bg-stock-drift px-1 font-mono text-sm text-seal-ink"
        >
          {match[2]}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(<span key={`${keyPrefix}-${key++}`}>{text.slice(lastIndex)}</span>);
  }

  return nodes;
}

function FormattedText({ text }: { text: string }): ReactNode {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {parseInline(line, `line-${i}`)}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

interface DialogueOverlayProps {
  character: string;
  messages: DialogueMessage[];
  onComplete: () => void;
  storageKey?: string;
}

export function DialogueOverlay({ character, messages, onComplete, storageKey }: DialogueOverlayProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);
  const current = messages[index];
  const exampleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisible(true);
    if (messages.length === 0) {
      onComplete();
    }
    if (storageKey) {
      try {
        setHasViewed(localStorage.getItem(`dialogue_seen_${storageKey}`) === 'true');
      } catch {
        /* ignore */
      }
    }
  }, [messages, onComplete, storageKey]);

  const markViewed = useCallback(() => {
    if (storageKey) {
      try {
        localStorage.setItem(`dialogue_seen_${storageKey}`, 'true');
      } catch {
        /* ignore */
      }
    }
  }, [storageKey]);

  const advance = useCallback(() => {
    if (index + 1 >= messages.length) {
      markViewed();
      onComplete();
    } else {
      setIndex((i) => i + 1);
    }
  }, [index, messages.length, markViewed, onComplete]);

  const goBack = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const skip = useCallback(() => {
    markViewed();
    onComplete();
  }, [markViewed, onComplete]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        advance();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        skip();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [advance, goBack, skip]);

  const avatar = CHARACTER_AVATARS[character] || CHARACTER_AVATARS.default;
  const name = CHARACTER_NAMES[character] || CHARACTER_NAMES.default;
  const isLast = index >= messages.length - 1;

  if (!current) return null;

  return (
    <div
      className={`fixed inset-0 z-[1500] flex items-start justify-center bg-black/40 p-4 pt-2 transition-opacity duration-300 sm:items-start sm:pt-4 md:pt-8 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="plate plate-strong w-full max-w-xs p-3 sm:max-w-lg sm:p-4 md:max-w-2xl md:p-6">
        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:gap-8">
          <img
            src={avatar}
            alt={name}
            className="mx-auto h-24 w-24 flex-shrink-0 border border-hairline object-cover sm:h-28 sm:w-28 md:mx-0 md:h-36 md:w-36"
            onError={(e) => {
              (e.target as HTMLImageElement).src = CHARACTER_AVATARS.default;
            }}
          />
          <div className="flex min-h-[150px] flex-1 flex-col">
            <div className="register mb-3 text-center !text-ink md:mb-4 md:text-left">
              {name}
            </div>
            <div className="mb-4 flex-grow overflow-y-auto text-sm leading-relaxed text-ink sm:text-base">
              <FormattedText text={current.text} />
            </div>

            {current.example && (
              <div
                ref={exampleRef}
                className="mb-4 border border-hairline border-l-2 border-l-seal-ink bg-stock-drift p-3 sm:p-4"
              >
                <div className="register mb-2 flex items-center justify-center !text-seal-ink">
                  <Lightbulb className="mr-2 h-4 w-4" /> Example
                </div>
                <div className="whitespace-pre-wrap text-xs text-ink-soft sm:text-sm">
                  <FormattedText text={current.example} />
                </div>
              </div>
            )}

            {current.choices && current.choices.length > 0 ? (
              <div className="mt-auto flex flex-wrap justify-center gap-2">
                {current.choices.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => advance()}
                    className="border border-ink bg-ink px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-stock transition-colors hover:bg-seal hover:text-seal-ink"
                  >
                    {choice.text}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-auto flex flex-row flex-wrap items-center justify-center gap-2 sm:gap-3">
                <button
                  onClick={goBack}
                  disabled={index === 0}
                  className="flex min-h-[40px] items-center justify-center border border-hairline px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </button>
                <button
                  onClick={advance}
                  className="flex min-h-[40px] items-center justify-center bg-ink px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-stock transition-colors hover:bg-seal hover:text-seal-ink"
                >
                  {isLast ? 'Continue' : <span className="hidden sm:inline">Next</span>}
                  {!isLast && <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />}
                </button>
                {hasViewed && (
                  <button
                    onClick={skip}
                    className="flex min-h-[40px] items-center justify-center border border-hairline px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
                  >
                    <SkipForward className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Skip
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="register mt-3 text-right normal-case tracking-normal md:mt-4">
          Enter / Space to continue · ← back · Esc skip
        </div>
      </div>
    </div>
  );
}
