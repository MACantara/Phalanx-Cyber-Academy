import { useCallback, useMemo, useRef, useState } from 'react';

/* Lesson state machine — slices a flat exhibit list into bite-sized
   lessons, runs a mistakes review tail at the end of each lesson, and
   reports per-lesson results for checkpoint/XP banking. */

export interface ItemResult {
  correct: boolean;
  /** 0..1 evidence-citation quality for the item (flag precision/recall,
      cue ratings, cite success). Undefined = no evidence input. */
  evidenceAcc?: number;
  /** Learner's declared confidence on the committed verdict. */
  confidence?: 'low' | 'mid' | 'high';
}

interface QueueEntry<T> {
  item: T;
  isReview: boolean;
}

export interface LessonHandle<T> {
  /** Current queue position — the item to render. Undefined when a gate
      screen or the final report is showing. */
  current: QueueEntry<T> | undefined;
  /** Lesson the current item belongs to (review items keep their origin). */
  lessonIndex: number;
  totalLessons: number;
  positionInLesson: number;
  lessonSize: number;
  inReview: boolean;
  /** Between-lessons gate is showing. */
  atGate: boolean;
  /** Whole run finished (all lessons + review tails). */
  done: boolean;
  /** Missed items queued for the current lesson's review tail. */
  pendingReviewCount: number;
  /** Per-lesson breakdown for XP competence + progress. */
  lessonResults: Record<number, ItemResult[]>;
  recordResult: (id: string, result: ItemResult) => void;
  /** Advance past the current item (call after recording + feedback). */
  advance: () => void;
  /** Leave the gate and start the next lesson. */
  continueLesson: () => void;
}

export function useLesson<T>(
  items: T[],
  opts: {
    getId: (t: T) => string;
    lessonSize?: number;
    resumeLessonIndex?: number;
    onLessonComplete?: (lessonIndex: number, results: ItemResult[]) => void;
  }
): LessonHandle<T> {
  const lessonSize = Math.max(1, opts.lessonSize ?? 7);
  const totalLessons = Math.max(1, Math.ceil(items.length / lessonSize));

  const baseQueue = useMemo<QueueEntry<T>[]>(
    () => items.map((item) => ({ item, isReview: false })),
    [items]
  );

  const resumeFrom = Math.min(
    Math.max(0, opts.resumeLessonIndex ?? 0),
    totalLessons - 1
  );
  const startPos = resumeFrom * lessonSize;

  const [pos, setPos] = useState(startPos);
  /** Lesson whose items are being served/reviewed right now — advances only
      after its review tail drains, so results bank against the right index. */
  const [activeLesson, setActiveLesson] = useState(resumeFrom);
  const [reviewQueue, setReviewQueue] = useState<QueueEntry<T>[]>([]);
  const [inReview, setInReview] = useState(false);
  const [atGate, setAtGate] = useState(resumeFrom > 0);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState<Record<number, ItemResult[]>>({});
  const resultsRef = useRef(results);
  resultsRef.current = results;
  const reviewSet = useRef<Set<string>>(new Set());

  const endOfBase = pos >= baseQueue.length;

  const current: QueueEntry<T> | undefined = inReview
    ? reviewQueue[0]
    : endOfBase
      ? undefined
      : baseQueue[pos];

  const finishLesson = useCallback(
    (lessonIndex: number) => {
      opts.onLessonComplete?.(lessonIndex, resultsRef.current[lessonIndex] ?? []);
      if (lessonIndex + 1 >= totalLessons) {
        setDone(true);
      } else {
        setAtGate(true);
      }
    },
    [opts, totalLessons]
  );

  const recordResult = useCallback(
    (id: string, result: ItemResult) => {
      setResults((prev) => ({
        ...prev,
        [activeLesson]: [...(prev[activeLesson] ?? []), result],
      }));
      const needsReview =
        !result.correct ||
        (result.evidenceAcc !== undefined && result.evidenceAcc < 0.5);
      if (needsReview && current && !current.isReview && !reviewSet.current.has(id)) {
        reviewSet.current.add(id);
        setReviewQueue((q) => [...q, { item: current.item, isReview: true }]);
      }
    },
    [activeLesson, current]
  );

  const advance = useCallback(() => {
    if (inReview) {
      const rest = reviewQueue.slice(1);
      setReviewQueue(rest);
      if (rest.length === 0) {
        setInReview(false);
        finishLesson(activeLesson);
      }
      return;
    }
    const next = pos + 1;
    const boundary = next >= baseQueue.length || Math.floor(next / lessonSize) !== activeLesson;
    setPos(next);
    if (boundary) {
      if (reviewQueue.length > 0) {
        setInReview(true);
      } else {
        finishLesson(activeLesson);
      }
    }
  }, [inReview, reviewQueue, pos, baseQueue.length, lessonSize, activeLesson, finishLesson]);

  const continueLesson = useCallback(() => {
    setAtGate(false);
    setActiveLesson((l) => Math.min(l + 1, totalLessons - 1));
  }, [totalLessons]);

  const positionInLesson = current?.isReview ? 0 : pos - activeLesson * lessonSize;

  return {
    current,
    lessonIndex: activeLesson,
    totalLessons,
    positionInLesson,
    lessonSize,
    inReview,
    atGate,
    done,
    pendingReviewCount: reviewQueue.length,
    lessonResults: results,
    recordResult,
    advance,
    continueLesson,
  };
}
