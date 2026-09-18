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
    <div className="flex h-full flex-col overflow-hidden bg-white text-gray-900">
      <div className="border-b border-gray-200 bg-gray-50 p-6">
        <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
          <Newspaper className="h-4 w-4" />
          <span className="truncate">{article.website}</span>
          <span className="mx-1">·</span>
          <span className="truncate">{new Date(article.date).toLocaleDateString()}</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{article.title}</h2>
        <p className="mt-1 text-sm text-gray-600">
          By {article.author} — {article.author_credentials}
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6 text-lg leading-relaxed whitespace-pre-wrap">
        {article.content}
      </div>

      <div className="border-t border-gray-200 p-6">
        {!answered ? (
          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              onClick={() => classify(0)}
              className="flex-1 rounded-lg border-2 border-green-500 bg-green-50 py-3 font-bold text-green-800 transition-colors hover:bg-green-100"
            >
              Credible
            </button>
            <button
              onClick={() => classify(1)}
              className="flex-1 rounded-lg border-2 border-red-500 bg-red-50 py-3 font-bold text-red-800 transition-colors hover:bg-red-100"
            >
              Misinformation
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-lg font-semibold">
              {answers[current.id] === current.label ? (
                <span className="flex items-center text-green-700">
                  <CheckCircle className="mr-1 h-5 w-5" /> Correct — this is {current.label === 1 ? 'misinformation' : 'credible'}
                </span>
              ) : (
                <span className="flex items-center text-red-700">
                  <XCircle className="mr-1 h-5 w-5" /> Incorrect — this is {current.label === 1 ? 'misinformation' : 'credible'}
                </span>
              )}
            </div>
            {index + 1 < total ? (
              <button
                onClick={next}
                className="flex w-full items-center justify-center rounded-lg bg-blue-600 py-3 font-bold text-white transition-colors hover:bg-blue-700"
              >
                Next Article <ArrowRight className="ml-2 h-5 w-5" />
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
          <h2 className="mb-2 text-2xl font-bold text-white">Analysis Complete</h2>
          <p className="mb-6 text-lg text-slate-300">
            You correctly classified {correctCount} of {total} articles.
          </p>
          <p className="mb-6 text-5xl font-bold text-blue-400">{score}</p>
          <div className="flex gap-4">
            <button
              onClick={() => startShutdown()}
              className="flex items-center rounded-lg bg-green-500 px-6 py-3 font-bold text-black transition-colors hover:bg-green-400"
            >
              <LogOut className="mr-2 h-5 w-5" /> Finish & Exit
            </button>
            <button
              onClick={() => startReplay()}
              className="flex items-center rounded-lg bg-blue-500 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-600"
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
        <div className="border-b border-slate-700 bg-slate-800 px-6 py-3 text-sm text-slate-300">
          Article {index + 1} of {total}
        </div>
        {current ? renderArticle(current) : null}
      </div>
    </FocusedSandboxLayout>
  );
}
