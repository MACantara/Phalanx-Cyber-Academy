import { ArrowRight, LogOut } from 'lucide-react';
import { AppFrame } from '../AppFrame';

interface LessonGateProps {
  title: string;
  instructions?: string;
  lessonIndex: number;
  totalLessons: number;
  reviewedCount: number;
  onContinue: () => void;
  onExit: () => void;
}

/* Between-lessons plate — progress stamp + continue / bank-and-exit. */
export function LessonGate({
  title,
  instructions,
  lessonIndex,
  totalLessons,
  reviewedCount,
  onContinue,
  onExit,
}: LessonGateProps) {
  return (
    <AppFrame title={title} instructions={instructions}>
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <span className="register mb-3">Lesson {lessonIndex + 1} of {totalLessons} — Certified</span>
        <h2 className="mb-2 text-2xl font-extrabold tracking-tight">Lesson Complete</h2>
        <p className="mb-6 text-ink-soft">
          {reviewedCount > 0
            ? `${reviewedCount} exhibit${reviewedCount === 1 ? '' : 's'} resurfaced for review.`
            : 'Clean run — nothing needed review.'}
        </p>
        <div className="stamp stamp-in mb-6 h-24 w-24 flex-col text-confirm">
          <span className="text-lg">{lessonIndex + 1}/{totalLessons}</span>
          <span className="text-[8px] tracking-[0.3em]">Lessons</span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onContinue}
            className="flex min-h-[44px] items-center justify-center bg-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal hover:text-seal-ink"
          >
            Next Lesson <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          <button
            onClick={onExit}
            className="flex min-h-[44px] items-center justify-center border border-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-stock-green"
          >
            <LogOut className="mr-2 h-5 w-5" /> Bank &amp; Exit
          </button>
        </div>
      </div>
    </AppFrame>
  );
}
