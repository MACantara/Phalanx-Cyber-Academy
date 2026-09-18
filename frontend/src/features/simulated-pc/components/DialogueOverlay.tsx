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
        <em key={`${keyPrefix}-${key++}`} className="italic text-green-300">
          {match[1]}
        </em>
      );
    } else if (match[2] !== undefined) {
      nodes.push(
        <code
          key={`${keyPrefix}-${key++}`}
          className="rounded bg-gray-700 px-1 font-mono text-sm text-yellow-300"
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
      <div className="w-full max-w-xs rounded-lg border-2 border-gray-600 bg-gray-800/95 p-3 shadow-2xl sm:max-w-lg sm:p-4 md:max-w-2xl md:p-6">
        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:gap-8">
          <img
            src={avatar}
            alt={name}
            className="mx-auto h-24 w-24 flex-shrink-0 rounded border-2 border-gray-600 object-cover sm:h-28 sm:w-28 md:mx-0 md:h-36 md:w-36"
            onError={(e) => {
              (e.target as HTMLImageElement).src = CHARACTER_AVATARS.default;
            }}
          />
          <div className="flex min-h-[150px] flex-1 flex-col">
            <div className="mb-3 text-center text-lg font-bold text-green-500 sm:text-xl md:mb-4 md:text-left">
              {name}
            </div>
            <div className="mb-4 flex-grow overflow-y-auto text-sm leading-relaxed text-green-400 sm:text-base md:text-lg">
              <FormattedText text={current.text} />
            </div>

            {current.example && (
              <div
                ref={exampleRef}
                className="mb-4 rounded-lg border-2 border-yellow-500 bg-gray-700/50 p-3 sm:p-4"
              >
                <div className="mb-2 flex items-center justify-center text-sm font-semibold text-yellow-400 sm:text-base">
                  <Lightbulb className="mr-2 h-4 w-4" /> Example
                </div>
                <div className="whitespace-pre-wrap text-xs text-gray-200 sm:text-sm md:text-base">
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
                    className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                  >
                    {choice.text}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-auto flex flex-row flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4">
                <button
                  onClick={goBack}
                  disabled={index === 0}
                  className="flex w-[70px] items-center justify-center rounded bg-gray-700 px-2 py-2 text-xs text-gray-300 transition-colors hover:bg-gray-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-[90px] sm:px-3 sm:text-sm md:w-[100px] md:text-base"
                >
                  <ChevronLeft className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </button>
                <button
                  onClick={advance}
                  className="flex w-[70px] items-center justify-center rounded bg-gray-700 px-2 py-2 text-xs text-green-400 transition-colors hover:bg-green-400 hover:text-black sm:w-[90px] sm:px-3 sm:text-sm md:w-[100px] md:text-base"
                >
                  {isLast ? 'Continue' : <span className="hidden sm:inline">Next</span>}
                  {!isLast && <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />}
                </button>
                {hasViewed && (
                  <button
                    onClick={skip}
                    className="flex w-[70px] items-center justify-center rounded bg-gray-700 px-2 py-2 text-xs text-gray-300 transition-colors hover:bg-gray-600 hover:text-white sm:w-[90px] sm:px-3 sm:text-sm md:w-[100px] md:text-base"
                  >
                    <SkipForward className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Skip
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="mt-3 text-right text-xs text-gray-400 md:mt-4">
          Click or press Enter / Space to continue, ← to go back, Esc to skip
        </div>
      </div>
    </div>
  );
}
