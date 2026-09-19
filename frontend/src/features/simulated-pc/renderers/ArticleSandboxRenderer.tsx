import { useMemo, useState } from 'react';
import { useSimulatedPC } from '../context/SimulatedPCContext';
import { FocusedSandboxLayout } from '../components/FocusedSandboxLayout';
import { Newspaper, ArrowRight, CheckCircle, XCircle, RefreshCcw, LogOut } from 'lucide-react';
import type { ArticleSandboxContent, Article } from '../types';

export function ArticleSandboxRenderer() {
  const { content, completeSession, startShutdown, startReplay, score } = useSimulatedPC();
  if (!content || content.type !== 'article-sandbox') return null;
  const articleContent = content as ArticleSandboxContent;

  const { title, instructions, articles, scoring } = articleContent;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);

  const current = articles[index];
  const total = articles.length;
  const answered = current ? answers[current.id] !== undefined : false;

  const computeScore = (allAnswers: Record<string, number>) => {
    const base = scoring.maxScore / total;
    const missedFake = scoring.penalties?.missedFakeNews ?? 0;
    const incorrect = scoring.penalties?.incorrectClassification ?? 0;
    const accuracyBonus = scoring.bonuses?.accuracyBonus ?? 0;
    const perfectBonus = scoring.bonuses?.perfectScore ?? 0;

    let raw = 0;
    let correct = 0;
    for (const a of articles) {
      const ans = allAnswers[a.id];
      if (ans === a.label) {
        raw += base;
        correct++;
      } else if (a.label === 1 && ans === 0) {
        raw += missedFake;
      } else {
        raw += incorrect;
      }
    }

    const accuracy = correct / total;
    if (accuracy >= 0.8) raw += accuracyBonus;
    if (correct === total) raw += perfectBonus;

    return Math.max(0, Math.min(scoring.maxScore, Math.round(raw)));
  };

  const correctCount = useMemo(() => {
    return articles.filter((a) => answers[a.id] === a.label).length;
  }, [answers, articles]);

  const classify = (value: number) => {
    if (!current) return;
    const nextAnswers = { ...answers, [current.id]: value };
    setAnswers(nextAnswers);

    if (index + 1 >= total) {
      const final = computeScore(nextAnswers);
      setFinished(true);
      completeSession(final);
    }
  };

  const next = () => {
    if (index + 1 < total) {
      setIndex((i) => i + 1);
    }
  };

  const renderArticle = (article: Article) => (
    <div className="flex h-full flex-col overflow-hidden">
      {/* document body keeps light "printed" stock — the exhibit is the paper */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#FCFBF9] text-[#191B1D]">
        <div className="border-b border-[#DDDCDA] bg-[#F4F3F1] p-4 sm:p-6">
          <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#5A5C5E]">
            <Newspaper className="h-4 w-4" />
            <span className="truncate">{article.website}</span>
            <span className="mx-1">·</span>
            <span className="truncate">{new Date(article.date).toLocaleDateString()}</span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">{article.title}</h2>
          <p className="mt-1 text-sm text-[#5A5C5E]">
            By {article.author} — {article.author_credentials}
          </p>
        </div>

        <div className="flex-1 overflow-auto whitespace-pre-wrap p-4 text-base leading-relaxed sm:p-6 sm:text-lg">
          {article.content}
        </div>
      </div>

      <div className="border-t border-ink bg-stock p-4 sm:p-6">
        {!answered ? (
          <div className="flex items-center gap-3">
            <span className="register mr-auto hidden sm:inline">Render verdict</span>
            <button
              onClick={() => classify(0)}
              className="min-h-[44px] flex-1 border-2 border-confirm px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-confirm transition-transform hover:-rotate-1 sm:flex-none sm:px-8"
            >
              Credible
            </button>
            <button
              onClick={() => classify(1)}
              className="min-h-[44px] flex-1 border-2 border-strike px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-strike transition-transform hover:-rotate-1 sm:flex-none sm:px-8"
            >
              Misinformation
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.14em]">
              {answers[current.id] === current.label ? (
                <span className="flex items-center text-confirm">
                  <CheckCircle className="mr-1 h-5 w-5" /> Correct — {current.label === 1 ? 'misinformation' : 'credible'}
                </span>
              ) : (
                <span className="flex items-center text-strike">
                  <XCircle className="mr-1 h-5 w-5" /> Incorrect — {current.label === 1 ? 'misinformation' : 'credible'}
                </span>
              )}
            </div>
            {index + 1 < total ? (
              <button
                onClick={next}
                className="flex min-h-[44px] w-full items-center justify-center bg-ink py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal hover:text-seal-ink"
              >
                Next Exhibit <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );

  if (finished) {
    return (
      <FocusedSandboxLayout title={title} instructions={instructions}>
        <div className="flex h-full flex-col items-center justify-center p-6 text-center">
          <span className="register mb-3">Session Report</span>
          <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-ink">Analysis Complete</h2>
          <p className="mb-6 text-ink-soft">
            You correctly classified {correctCount} of {total} exhibits.
          </p>
          <div className="stamp stamp-in mb-6 h-28 w-28 flex-col text-confirm">
            <span className="text-xl">{score}</span>
            <span className="text-[8px] tracking-[0.3em]">Marks</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => startShutdown()}
              className="flex min-h-[44px] items-center bg-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal hover:text-seal-ink"
            >
              <LogOut className="mr-2 h-5 w-5" /> Finish & Exit
            </button>
            <button
              onClick={() => startReplay()}
              className="flex min-h-[44px] items-center border border-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-stock-green"
            >
              <RefreshCcw className="mr-2 h-5 w-5" /> Replay
            </button>
          </div>
        </div>
      </FocusedSandboxLayout>
    );
  }

  return (
    <FocusedSandboxLayout
      title={title}
      instructions={instructions}
    >
      <div className="flex h-full flex-col">
        <div className="register border-b border-hairline bg-stock-drift px-4 py-2 sm:px-6">
          Exhibit {index + 1} of {total}
        </div>
        {current ? renderArticle(current) : null}
      </div>
    </FocusedSandboxLayout>
  );
}
