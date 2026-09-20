import { useEffect, useMemo, useState } from 'react';
import { useSimulatedPC } from '../context/SimulatedPCContext';
import { AppFrame } from '../components/AppFrame';
import { DebriefLine } from '../components/DebriefLine';
import { FlaggableBody } from '../components/exercise/FlaggableBody';
import { TechniqueChecklist } from '../components/exercise/TechniqueChecklist';
import { ConfidenceControl, type Confidence } from '../components/exercise/ConfidenceControl';
import { LessonGate } from '../components/exercise/LessonGate';
import { useLesson } from '../lib/useLesson';
import { regionKey, scoreFlags } from '../lib/evidence';
import { TECHNIQUES } from '../lib/techniques';
import { Inbox, Mail, Flag, ShieldCheck, ShieldAlert, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import type { EmailItem, MailContent, ScoringEvent } from '../types';

/* Mail — cite-before-verdict. Each exhibit: flag the evidence regions,
   name the techniques, declare confidence, then stamp the verdict.
   Scaffold fades worked → prompted → free across the item order; missed
   items resurface in a per-lesson review tail. */

interface ItemState {
  marked: Set<string>;
  techniques: Set<string>;
  confidence?: Confidence;
}

const EMPTY: ItemState = { marked: new Set(), techniques: new Set() };

function techniqueOptions(email: EmailItem): string[] {
  const authored = email.techniques ?? [];
  const decoys = Object.keys(TECHNIQUES).filter((k) => !authored.includes(k));
  return [...authored, ...decoys.slice(0, Math.max(0, 4 - authored.length))];
}

function techniqueAcc(email: EmailItem, selected: Set<string>): number | undefined {
  if (!email.techniques) return undefined;
  const authored = new Set(email.techniques);
  const hits = [...selected].filter((k) => authored.has(k)).length;
  const extra = [...selected].filter((k) => !authored.has(k)).length;
  const denom = authored.size + extra;
  return denom === 0 ? 1 : hits / denom;
}

export function MailApp() {
  const { environment, completeSession, startShutdown, startReplay, addScoringEvent, emit, unlocked, score } = useSimulatedPC();
  if (!environment) return null;
  const mail = environment.content.mail as MailContent | undefined;

  // Locked items are scenario-gated: they surface only once a trigger unlocks
  // their content id — that's how mail arrives mid-scenario.
  const emails = useMemo(
    () => (mail?.emails ?? []).filter((e) => !e.locked || unlocked.has(e.id)),
    [mail, unlocked]
  );

  const lesson = useLesson(emails, {
    getId: (e) => e.id,
    lessonSize: environment.scenario?.lessonSize,
    onLessonComplete: (lessonIndex, results) => {
      const correct = results.filter((r) => r.correct).length;
      const ev = results.map((r) => r.evidenceAcc).filter((v): v is number => v !== undefined);
      emit({
        app: 'mail',
        action: 'lesson',
        target: `lesson-${lessonIndex}`,
        data: {
          lessonIndex,
          verdictAcc: results.length ? correct / results.length : 0,
          evidenceAcc: ev.length ? ev.reduce((a, b) => a + b, 0) / ev.length : undefined,
        },
      });
    },
  });

  const [states, setStates] = useState<Record<string, ItemState>>({});
  const [reviewStates, setReviewStates] = useState<Record<string, ItemState>>({});
  const [answers, setAnswers] = useState<Record<string, 'phishing' | 'legitimate'>>({});
  const [reviewAnswers, setReviewAnswers] = useState<Record<string, 'phishing' | 'legitimate'>>({});
  const [flagScores, setFlagScores] = useState<Record<string, number>>({});

  const current = lesson.current?.item;
  // Review-tail items re-run fresh: first-pass answers stay on record for
  // scoring, but the exhibit presents as a new attempt.
  const reviewMode = !!lesson.current?.isReview;
  const answerMap = reviewMode ? reviewAnswers : answers;
  const stateMap = reviewMode ? reviewStates : states;
  const answered = current ? answerMap[current.id] : undefined;
  const state = current ? (stateMap[current.id] ?? EMPTY) : EMPTY;
  const scaffold = current?.scaffold ?? 'prompted';
  const hasFlags = (current?.flags?.length ?? 0) > 0;
  const needsFlag = scaffold === 'prompted' && hasFlags && !answered;
  const flagsLocked = scaffold === 'worked' || answered !== undefined;

  const patch = (id: string, p: Partial<ItemState>) =>
    (reviewMode ? setReviewStates : setStates)((prev) => ({
      ...prev,
      [id]: { ...EMPTY, ...prev[id], ...p },
    }));

  const toggleMark = (email: EmailItem, key: string) => {
    if (flagsLocked) return;
    const next = new Set(state.marked);
    next.has(key) ? next.delete(key) : next.add(key);
    patch(email.id, { marked: next });
    emit({ app: 'mail', action: 'flag', target: email.id, data: { region: key, on: next.has(key) } });
  };

  const toggleTechnique = (email: EmailItem, key: string) => {
    if (answered) return;
    const next = new Set(state.techniques);
    next.has(key) ? next.delete(key) : next.add(key);
    patch(email.id, { techniques: next });
  };

  // Worked items arrive pre-flagged — the authored regions are the worked example.
  const displayMarked = (email: EmailItem): Set<string> => {
    if (email.scaffold !== 'worked' || answers[email.id] !== undefined) return state.marked;
    const m = new Set<string>();
    for (const f of email.flags ?? []) {
      if (f.region === 'sender') m.add(regionKey.sender);
      else if (f.region === 'subject') m.add(regionKey.subject);
      else if (f.region === 'link' && f.match) {
        email.links?.forEach((l) => l.url.includes(f.match!) && m.add(regionKey.link(l.url)));
      }
      // body flags surface via revealMatches styling after verdict
    }
    return m;
  };

  const classify = (label: 'phishing' | 'legitimate') => {
    if (!current || answered) return;
    const e = current;
    const expected = e.isPhishing ? 'phishing' : 'legitimate';
    const correctItem = environment.scoring.rubric.find((r) => r.id === 'correct');
    const points = label === expected ? (correctItem?.maxPoints ?? 100) : 0;
    const fs = hasFlags ? scoreFlags(e, displayMarked(e)) : undefined;
    const ta = techniqueAcc(e, state.techniques);
    const evidenceAcc =
      fs && ta !== undefined ? (fs.acc + ta) / 2 : fs ? fs.acc : ta;

    if (!lesson.inReview) {
      const event: ScoringEvent = {
        type: 'email-classified',
        id: e.id,
        points,
        app: 'mail',
        action: 'classify',
        target: e.id,
      };
      addScoringEvent(event);
      if (fs) setFlagScores((prev) => ({ ...prev, [e.id]: fs.acc }));
    }
    emit({
      app: 'mail',
      action: 'classify',
      target: e.id,
      data: {
        verdict: label,
        correct: label === expected,
        evidenceAcc,
        confidence: state.confidence,
        techniques: [...state.techniques],
        review: reviewMode,
      },
    });
    if (reviewMode) {
      // Review attempts don't re-bank results — the miss already counted;
      // the re-take is retrieval practice, not grade replacement.
      setReviewAnswers((prev) => ({ ...prev, [e.id]: label }));
    } else {
      setAnswers((prev) => ({ ...prev, [e.id]: label }));
      lesson.recordResult(e.id, { correct: label === expected, evidenceAcc, confidence: state.confidence });
    }
  };

  const isCorrect = (id: string) => {
    const e = emails.find((item) => item.id === id);
    if (!e || answers[id] === undefined) return null;
    return (e.isPhishing ? 'phishing' : 'legitimate') === answers[id];
  };

  const correct = emails.filter((e) => isCorrect(e.id) === true).length;

  // App-level finish is advisory: environment objectives may still gate it.
  useEffect(() => {
    if (lesson.done) completeSession();
  }, [lesson.done, completeSession]);

  const lessonEmails = emails.slice(
    lesson.lessonIndex * lesson.lessonSize,
    lesson.lessonIndex * lesson.lessonSize + lesson.lessonSize
  );

  if (lesson.done) {
    return (
      <AppFrame title={environment.title} instructions={environment.briefing}>
        <div className="flex h-full flex-col items-center justify-center p-6 text-center">
          <span className="register mb-3">Session Report</span>
          <h2 className="mb-2 text-2xl font-extrabold tracking-tight">Email Security Complete</h2>
          <p className="mb-6 text-ink-soft">You correctly identified {correct} of {emails.length} exhibits.</p>
          <DebriefLine className="mb-6" />
          <div className="stamp stamp-in mb-6 h-28 w-28 flex-col text-confirm">
            <span className="text-xl">{score}</span>
            <span className="text-[8px] tracking-[0.3em]">Marks</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => startShutdown()}
              className="min-h-[44px] bg-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock hover:bg-seal hover:text-seal-ink"
            >
              Finish & Exit
            </button>
            <button
              onClick={() => startReplay()}
              className="min-h-[44px] border border-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink hover:bg-stock-green"
            >
              Replay
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

  return (
    <AppFrame title={environment.title} instructions={environment.briefing}>
      <div className="flex h-full flex-col bg-stock text-ink">
        <div className="register flex items-center border-b border-hairline bg-stock-drift px-3 py-2">
          <Inbox className="mr-2 h-4 w-4" />
          Lesson {lesson.lessonIndex + 1}/{lesson.totalLessons} · Exhibits ({lessonEmails.length})
          {lesson.inReview && <span className="ml-auto text-strike">Review — resurface</span>}
        </div>
        <div className="flex flex-1 flex-col overflow-hidden sm:flex-row">
          <div className="w-full overflow-x-auto border-b border-hairline sm:w-64 sm:overflow-y-auto sm:border-b-0 sm:border-r">
            <div className="flex sm:block">
              {lessonEmails.map((email, i) => {
                const status = isCorrect(email.id);
                const isCurrent = current?.id === email.id;
                const exh = lesson.lessonIndex * lesson.lessonSize + i + 1;
                return (
                  <div
                    key={email.id}
                    className={`relative w-56 shrink-0 border-r border-hairline-soft px-3 py-3 text-left sm:w-full sm:border-b sm:border-r-0 ${
                      isCurrent ? 'bg-seal text-seal-ink' : 'opacity-70'
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute bottom-0 left-0 top-0 w-0.5 bg-ink" aria-hidden="true" />
                    )}
                    <div className="flex items-center gap-2">
                      {status === true && <CheckCircle className="h-4 w-4 text-confirm" />}
                      {status === false && <XCircle className="h-4 w-4 text-strike" />}
                      {status === null && <Mail className="h-4 w-4 opacity-60" />}
                      <p className="truncate text-sm font-semibold">{email.from}</p>
                    </div>
                    <p className="truncate text-xs text-ink-soft">{email.subject}</p>
                    <p className={`mt-1 font-mono text-[9px] uppercase tracking-[0.14em] ${
                      answers[email.id] === 'phishing' ? 'text-strike' : answers[email.id] ? 'text-confirm' : 'text-ink-soft'
                    }`}>
                      EXH-{String(exh).padStart(2, '0')} · {answers[email.id] ? `Marked ${answers[email.id]}` : 'Awaiting verdict'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            {current ? (
              <>
                <div className="border-b border-hairline p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <button
                        onClick={() => toggleMark(current, regionKey.subject)}
                        disabled={flagsLocked}
                        aria-pressed={displayMarked(current).has(regionKey.subject)}
                        className={`block w-full border px-2 py-1 text-left transition-colors ${
                          displayMarked(current).has(regionKey.subject)
                            ? 'border-strike bg-strike/10'
                            : 'border-transparent hover:border-hairline'
                        }`}
                      >
                        <h2 className="text-lg font-extrabold tracking-tight text-ink">{current.subject}</h2>
                      </button>
                      <button
                        onClick={() => toggleMark(current, regionKey.sender)}
                        disabled={flagsLocked}
                        aria-pressed={displayMarked(current).has(regionKey.sender)}
                        className={`mt-1 flex w-full items-center gap-2 border px-2 py-1 text-left transition-colors ${
                          displayMarked(current).has(regionKey.sender)
                            ? 'border-strike bg-strike/10'
                            : 'border-transparent hover:border-hairline'
                        }`}
                      >
                        <Flag className={`h-3.5 w-3.5 shrink-0 ${displayMarked(current).has(regionKey.sender) ? 'text-strike' : 'text-hairline'}`} />
                        <span className="register normal-case tracking-normal">
                          From: <span className="font-bold text-ink">{current.from}</span>
                        </span>
                      </button>
                    </div>
                    {answered ? (
                      current.isPhishing ? (
                        <span className="shrink-0 border border-strike px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-strike">Flagged</span>
                      ) : (
                        <span className="shrink-0 border border-confirm px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-confirm">Verified</span>
                      )
                    ) : (
                      <span className="shrink-0 border border-hairline px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">
                        {scaffold === 'worked' ? 'Worked example' : scaffold === 'free' ? 'Free' : 'Unclassified'}
                      </span>
                    )}
                  </div>
                </div>

                <FlaggableBody
                  body={current.body}
                  marked={displayMarked(current)}
                  onToggle={(key) => toggleMark(current, key)}
                  disabled={flagsLocked}
                  revealMatches={answered ? current.flags?.filter((f) => f.region === 'body' && f.match).map((f) => f.match!) : undefined}
                />

                {current.links && current.links.length > 0 && (
                  <div className="border-t border-hairline bg-stock-drift p-4">
                    <p className="register mb-2">Referenced locations — tap to flag, arrow to visit</p>
                    <div className="flex flex-wrap gap-2">
                      {current.links.map((link) => {
                        const key = regionKey.link(link.url);
                        const on = displayMarked(current).has(key);
                        return (
                          <div key={link.url} className="flex items-stretch">
                            <button
                              onClick={() => toggleMark(current, key)}
                              disabled={flagsLocked}
                              aria-pressed={on}
                              className={`min-h-[44px] border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                                on
                                  ? 'border-strike bg-strike/10 text-strike'
                                  : 'border-ink text-seal-ink hover:bg-stock-green'
                              }`}
                            >
                              <Flag className="mr-1.5 inline h-3.5 w-3.5" />{link.label}
                            </button>
                            <button
                              onClick={() => emit({ app: 'mail', action: 'click-link', target: link.url })}
                              aria-label={`Visit ${link.label}`}
                              className="min-h-[44px] border border-l-0 border-ink px-3 font-mono text-[11px] text-seal-ink transition-colors hover:bg-seal hover:text-seal-ink"
                            >
                              →
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {answered && (
                  <div className="border-t border-hairline bg-stock-drift p-4">
                    {current.isPhishing ? (
                      <span className="flex items-center font-mono text-[11px] uppercase tracking-[0.14em] text-strike">
                        <ShieldAlert className="mr-1 h-4 w-4" /> Verdict — Phishing
                      </span>
                    ) : (
                      <span className="flex items-center font-mono text-[11px] uppercase tracking-[0.14em] text-confirm">
                        <ShieldCheck className="mr-1 h-4 w-4" /> Verdict — Legitimate
                      </span>
                    )}
                    {flagScores[current.id] !== undefined && hasFlags && (
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
                        Evidence — {Math.round(flagScores[current.id] * 100)}% cited
                      </p>
                    )}
                    {current.flags && current.flags.length > 0 && (
                      <div className="mt-2">
                        <p className="register !text-strike">Evidence on record</p>
                        <ul className="list-disc space-y-0.5 pl-4 text-xs text-ink-soft">
                          {current.flags.map((f) => (
                            <li key={f.id}>{f.why}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {current.redFlags && current.redFlags.length > 0 && !current.flags?.length && (
                      <div className="mt-2">
                        <p className="register !text-strike">Red flags</p>
                        <ul className="list-disc space-y-0.5 pl-4 text-xs text-ink-soft">
                          {current.redFlags.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {current.explanation && (
                      <p className="mt-2 text-sm text-ink-soft">{current.explanation}</p>
                    )}
                    <button
                      onClick={lesson.advance}
                      className="mt-3 flex min-h-[44px] w-full items-center justify-center bg-ink py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal hover:text-seal-ink"
                    >
                      Next <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                  </div>
                )}

                {!answered && (
                  <div className="space-y-3 border-t border-ink p-4">
                    {current.techniques && (
                      <TechniqueChecklist
                        options={techniqueOptions(current)}
                        selected={state.techniques}
                        onToggle={(k) => toggleTechnique(current, k)}
                      />
                    )}
                    <ConfidenceControl
                      value={state.confidence}
                      onChange={(c) => patch(current.id, { confidence: c })}
                    />
                    {needsFlag && state.marked.size === 0 && (
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-strike">
                        Flag at least one piece of evidence to render a verdict
                      </p>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="register mr-auto hidden sm:inline">Render verdict</span>
                      <button
                        onClick={() => classify('legitimate')}
                        disabled={needsFlag && state.marked.size === 0}
                        className="relative min-h-[44px] flex-1 border-2 border-confirm px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-confirm transition-transform hover:-rotate-1 disabled:opacity-50 sm:flex-none sm:px-6"
                      >
                        Legitimate
                      </button>
                      <button
                        onClick={() => classify('phishing')}
                        disabled={needsFlag && state.marked.size === 0}
                        className="relative min-h-[44px] flex-1 border-2 border-strike px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-strike transition-transform hover:-rotate-1 disabled:opacity-50 sm:flex-none sm:px-6"
                      >
                        Phishing
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
