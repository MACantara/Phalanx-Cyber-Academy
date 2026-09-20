import { useState } from 'react';
import { useSimulatedPC } from '../context/SimulatedPCContext';
import { AppFrame } from '../components/AppFrame';
import { Inbox, Mail, ShieldCheck, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import type { MailContent, ScoringEvent } from '../types';

export function MailApp() {
  const { environment, completeSession, startShutdown, startReplay, addScoringEvent, emit, unlocked, score } = useSimulatedPC();
  if (!environment) return null;
  const mail = environment.content.mail as MailContent | undefined;

  // Locked items are scenario-gated: they surface only once a trigger unlocks
  // their content id — that's how mail arrives mid-scenario.
  const emails = (mail?.emails ?? []).filter((e) => !e.locked || unlocked.has(e.id));
  const [selectedId, setSelectedId] = useState<string>(emails[0]?.id ?? '');
  const [answers, setAnswers] = useState<Record<string, 'phishing' | 'legitimate'>>({});
  const [finished, setFinished] = useState(false);

  const selectEmail = (id: string) => {
    setSelectedId(id);
    emit({ app: 'mail', action: 'open', target: id });
  };

  const selected = emails.find((e) => e.id === selectedId) ?? emails[0];
  const answered = selected ? answers[selected.id] : undefined;
  const correct = emails.filter((e) => (e.isPhishing ? 'phishing' : 'legitimate') === answers[e.id]).length;

  const isCorrect = (id: string) => {
    const e = emails.find((item) => item.id === id);
    if (!e || answers[id] === undefined) return null;
    return (e.isPhishing ? 'phishing' : 'legitimate') === answers[id];
  };

  const classify = (label: 'phishing' | 'legitimate') => {
    if (!selected) return;
    const e = selected;
    const expected = e.isPhishing ? 'phishing' : 'legitimate';
    const correctItem = environment.scoring.rubric.find((r) => r.id === 'correct');
    const points = label === expected ? (correctItem?.maxPoints ?? 100) : 0;
    const event: ScoringEvent = {
      type: 'email-classified',
      id: e.id,
      points,
      app: 'mail',
      action: 'classify',
      target: e.id,
    };
    addScoringEvent(event);
    emit({ app: 'mail', action: 'classify', target: e.id, data: { verdict: label, correct: label === expected } });
    setAnswers((prev) => ({ ...prev, [e.id]: label }));
    const nextIndex = emails.findIndex((item) => item.id === e.id) + 1;
    if (nextIndex < emails.length) {
      selectEmail(emails[nextIndex].id);
    } else {
      setFinished(true);
      completeSession();
    }
  };

  if (finished) {
    return (
      <AppFrame title={environment.title} instructions={environment.briefing}>
        <div className="flex h-full flex-col items-center justify-center p-6 text-center">
          <span className="register mb-3">Session Report</span>
          <h2 className="mb-2 text-2xl font-extrabold tracking-tight">Email Security Complete</h2>
          <p className="mb-6 text-ink-soft">You correctly identified {correct} of {emails.length} exhibits.</p>
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
            <button
              onClick={() => setFinished(false)}
              className="min-h-[44px] px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink-soft hover:text-ink"
            >
              Back to Inbox
            </button>
          </div>
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame title={environment.title} instructions={environment.briefing}>
      <div className="flex h-full flex-col bg-stock text-ink">
        <div className="register flex items-center border-b border-hairline bg-stock-drift px-3 py-2">
          <Inbox className="mr-2 h-4 w-4" /> Exhibits ({emails.length})
        </div>
        <div className="flex flex-1 flex-col overflow-hidden sm:flex-row">
          <div className="w-full overflow-x-auto border-b border-hairline sm:w-64 sm:overflow-y-auto sm:border-b-0 sm:border-r">
            <div className="flex sm:block">
              {emails.map((email, i) => {
                const status = isCorrect(email.id);
                return (
                  <button
                    key={email.id}
                    onClick={() => selectEmail(email.id)}
                    className={`relative w-56 shrink-0 border-r border-hairline-soft px-3 py-3 text-left transition-colors sm:w-full sm:border-b sm:border-r-0 ${
                      selectedId === email.id ? 'bg-seal text-seal-ink' : 'hover:bg-stock-green'
                    }`}
                  >
                    {selectedId === email.id && (
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
                      EXH-{String(i + 1).padStart(2, '0')} · {answers[email.id] ? `Marked ${answers[email.id]}` : 'Awaiting verdict'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            {selected ? (
              <>
                <div className="border-b border-hairline p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-lg font-extrabold tracking-tight text-ink">{selected.subject}</h2>
                      <p className="register mt-1 normal-case tracking-normal">
                        From: <span className="font-bold text-ink">{selected.from}</span>
                      </p>
                    </div>
                    {answered ? (
                      selected.isPhishing ? (
                        <span className="shrink-0 border border-strike px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-strike">Flagged</span>
                      ) : (
                        <span className="shrink-0 border border-confirm px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-confirm">Verified</span>
                      )
                    ) : (
                      <span className="shrink-0 border border-hairline px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">Unclassified</span>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-auto whitespace-pre-wrap p-4 text-sm leading-relaxed text-ink sm:p-5">{selected.body}</div>

                {selected.links && selected.links.length > 0 && (
                  <div className="border-t border-hairline bg-stock-drift p-4">
                    <p className="register mb-2">Referenced locations</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.links.map((link) => (
                        <button
                          key={link.url}
                          onClick={() => emit({ app: 'mail', action: 'click-link', target: link.url })}
                          className="min-h-[44px] border border-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-seal-ink transition-colors hover:bg-seal hover:text-seal-ink"
                        >
                          {link.label} →
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {answered && (
                  <div className="border-t border-hairline bg-stock-drift p-4">
                    {selected.isPhishing ? (
                      <span className="flex items-center font-mono text-[11px] uppercase tracking-[0.14em] text-strike">
                        <ShieldAlert className="mr-1 h-4 w-4" /> Verdict — Phishing
                      </span>
                    ) : (
                      <span className="flex items-center font-mono text-[11px] uppercase tracking-[0.14em] text-confirm">
                        <ShieldCheck className="mr-1 h-4 w-4" /> Verdict — Legitimate
                      </span>
                    )}
                    {selected.redFlags && selected.redFlags.length > 0 && (
                      <div className="mt-2">
                        <p className="register !text-strike">Red flags</p>
                        <ul className="list-disc space-y-0.5 pl-4 text-xs text-ink-soft">
                          {selected.redFlags.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selected.explanation && (
                      <p className="mt-2 text-sm text-ink-soft">{selected.explanation}</p>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3 border-t border-ink p-4">
                  <span className="register mr-auto hidden sm:inline">Render verdict</span>
                  <button
                    onClick={() => classify('legitimate')}
                    disabled={answered !== undefined}
                    className="relative min-h-[44px] flex-1 border-2 border-confirm px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-confirm transition-transform hover:-rotate-1 disabled:opacity-50 sm:flex-none sm:px-6"
                  >
                    Legitimate
                  </button>
                  <button
                    onClick={() => classify('phishing')}
                    disabled={answered !== undefined}
                    className="relative min-h-[44px] flex-1 border-2 border-strike px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-strike transition-transform hover:-rotate-1 disabled:opacity-50 sm:flex-none sm:px-6"
                  >
                    Phishing
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
