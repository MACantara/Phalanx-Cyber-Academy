import { useEffect, useMemo, useState } from 'react';
import { useSimulatedPC } from '../context/SimulatedPCContext';
import { AppFrame } from '../components/AppFrame';
import { DebriefLine } from '../components/DebriefLine';
import { CueRatings, cueAccuracy, type CueKey, type CueRating } from '../components/exercise/CueRatings';
import { ConfidenceControl, type Confidence } from '../components/exercise/ConfidenceControl';
import { LessonGate } from '../components/exercise/LessonGate';
import { useLesson } from '../lib/useLesson';
import { Newspaper, ArrowRight, CheckCircle, XCircle, RefreshCcw, LogOut } from 'lucide-react';
import type { Article, ReaderContent } from '../types';

/* Reader — cue-triage before verdict. Each article: rate the credibility
   dimensions (source/author/evidence/recency), declare confidence, then
   stamp the verdict. Missed exhibits resurface in a review tail. */

interface ItemState {
  cues: Partial<Record<CueKey, CueRating>>;
  confidence?: Confidence;
}

const EMPTY: ItemState = { cues: {} };

export function ReaderApp() {
  const { environment, completeSession, startShutdown, startReplay, emit, score, bankLesson, resumeState } = useSimulatedPC();
  if (!environment) return null;
  const reader = environment.content.reader as ReaderContent | undefined;

  const articles = useMemo(() => reader?.articles ?? [], [reader]);
  const scoring = environment.scoring;
  const readerResume = (resumeState?.reader as { lessonIndex?: number } | undefined)?.lessonIndex ?? 0;
  const lesson = useLesson(articles, {
    getId: (a) => a.id,
    lessonSize: environment.scenario?.lessonSize,
    resumeLessonIndex: readerResume,
    onLessonComplete: (lessonIndex, results) => {
      const correct = results.filter((r) => r.correct).length;
      const ev = results.map((r) => r.evidenceAcc).filter((v): v is number => v !== undefined);
      emit({
        app: 'reader',
        action: 'lesson',
        target: `lesson-${lessonIndex}`,
        data: {
          lessonIndex,
          verdictAcc: results.length ? correct / results.length : 0,
          evidenceAcc: ev.length ? ev.reduce((a, b) => a + b, 0) / ev.length : undefined,
        },
      });
      bankLesson('reader', lessonIndex, Math.ceil(articles.length / (environment.scenario?.lessonSize ?? 7)), results);
    },
  });
  const [states, setStates] = useState<Record<string, ItemState>>({});
  const [reviewStates, setReviewStates] = useState<Record<string, ItemState>>({});
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [reviewAnswers, setReviewAnswers] = useState<Record<string, number>>({});

  const current = lesson.current?.item;
  const total = articles.length;
  const reviewMode = !!lesson.current?.isReview;
  const answerMap = reviewMode ? reviewAnswers : answers;
  const stateMap = reviewMode ? reviewStates : states;
  const answered = current ? answerMap[current.id] !== undefined : false;
  const state = current ? (stateMap[current.id] ?? EMPTY) : EMPTY;
  const scaffold = current?.scaffold ?? 'prompted';
  const hasCues = !!current?.cues && Object.values(current.cues).some((v) => v !== undefined);
  const ratedDims = current?.cues
    ? (Object.keys(current.cues) as CueKey[]).filter((k) => current.cues![k] !== undefined)
    : [];
  const allRated = ratedDims.every((k) => state.cues[k] !== undefined);
  const needsCues = scaffold === 'prompted' && hasCues && !answered;

  const patch = (id: string, p: Partial<ItemState>) =>
    (reviewMode ? setReviewStates : setStates)((prev) => ({
      ...prev,
      [id]: { ...EMPTY, ...prev[id], ...p },
    }));

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
    if (!current || answered) return;
    const correct = value === current.label;
    const evAcc = cueAccuracy(current.cues, state.cues);
    emit({
      app: 'reader',
      action: 'classify',
      target: current.id,
      data: { value, correct, evidenceAcc: evAcc, confidence: state.confidence, review: reviewMode },
    });
    if (reviewMode) {
      setReviewAnswers((prev) => ({ ...prev, [current.id]: value }));
    } else {
      setAnswers((prev) => ({ ...prev, [current.id]: value }));
      lesson.recordResult(current.id, { correct, evidenceAcc: evAcc, confidence: state.confidence });
    }
  };

  // App-level finish is advisory: environment objectives may still gate it.
  useEffect(() => {
    if (lesson.done) completeSession(computeScore(answers));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.done, completeSession]);

  if (lesson.done) {
    return (
      <AppFrame title={environment.title} instructions={environment.briefing}>
        <div className="flex h-full flex-col items-center justify-center p-6 text-center">
          <span className="register mb-3">Session Report</span>
          <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-ink">Analysis Complete</h2>
          <p className="mb-6 text-ink-soft">
            You correctly classified {correctCount} of {total} exhibits.
          </p>
          <DebriefLine className="mb-6" />
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
      </AppFrame>
    );
  }

  if (lesson.atGate) {
    return (
      <LessonGate
        title={environment.title}
        instructions={environment.briefing}
        lessonIndex={lesson.lessonIndex}
        totalLessons={lesson.totalLessons}
        reviewedCount={lesson.pendingReviewCount}
        onContinue={lesson.continueLesson}
        onExit={startShutdown}
      />
    );
  }

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

      <div className="space-y-3 border-t border-ink bg-stock p-4 sm:p-6">
        {!answered ? (
          <>
            {hasCues && (
              <CueRatings
                values={state.cues}
                onRate={(dim, r) => patch(article.id, { cues: { ...state.cues, [dim]: r } })}
              />
            )}
            <ConfidenceControl
              value={state.confidence}
              onChange={(c) => patch(article.id, { confidence: c })}
            />
            {needsCues && !allRated && (
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-strike">
                Rate every cue to render a verdict
              </p>
            )}
            <div className="flex items-center gap-3">
              <span className="register mr-auto hidden sm:inline">Render verdict</span>
              <button
                onClick={() => classify(0)}
                disabled={needsCues && !allRated}
                className="min-h-[44px] flex-1 border-2 border-confirm px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-confirm transition-transform hover:-rotate-1 disabled:opacity-50 sm:flex-none sm:px-8"
              >
                Credible
              </button>
              <button
                onClick={() => classify(1)}
                disabled={needsCues && !allRated}
                className="min-h-[44px] flex-1 border-2 border-strike px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-strike transition-transform hover:-rotate-1 disabled:opacity-50 sm:flex-none sm:px-8"
              >
                Misinformation
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.14em]">
              {answerMap[article.id] === article.label ? (
                <span className="flex items-center text-confirm">
                  <CheckCircle className="mr-1 h-5 w-5" /> Correct — {article.label === 1 ? 'misinformation' : 'credible'}
                </span>
              ) : (
                <span className="flex items-center text-strike">
                  <XCircle className="mr-1 h-5 w-5" /> Incorrect — {article.label === 1 ? 'misinformation' : 'credible'}
                </span>
              )}
            </div>
            {hasCues && <CueRatings values={state.cues} onRate={() => {}} disabled reveal={article.cues} />}
            <button
              onClick={lesson.advance}
              className="flex min-h-[44px] w-full items-center justify-center bg-ink py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal hover:text-seal-ink"
            >
              Next <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AppFrame
      title={environment.title}
      instructions={environment.briefing}
    >
      <div className="flex h-full flex-col">
        <div className="register border-b border-hairline bg-stock-drift px-4 py-2 sm:px-6">
          Lesson {lesson.lessonIndex + 1}/{lesson.totalLessons} · Exhibit {lesson.positionInLesson + 1}
          {lesson.inReview && <span className="ml-2 text-strike">— Review</span>}
        </div>
        {current ? renderArticle(current) : null}
      </div>
    </AppFrame>
  );
}
