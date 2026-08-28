import { useState } from 'react';
import { useSimulatedPC } from '../context/SimulatedPCContext';
import { FocusedSandboxLayout } from '../components/FocusedSandboxLayout';
import { Inbox, Mail, ShieldCheck, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import type { EmailSandboxContent, ScoringEvent } from '../types';

export function EmailSandboxRenderer() {
  const { content, completeSession, startShutdown, startReplay, addScoringEvent, score } = useSimulatedPC();
  if (!content || content.type !== 'email-sandbox') return null;
  const emailContent = content as EmailSandboxContent;

  const emails = emailContent.emails;
  const [selectedId, setSelectedId] = useState<string>(emails[0]?.id ?? '');
  const [answers, setAnswers] = useState<Record<string, 'phishing' | 'legitimate'>>({});
  const [finished, setFinished] = useState(false);

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
    const correctItem = emailContent.scoring.rubric.find((r) => r.id === 'correct');
    const points = label === expected ? (correctItem?.maxPoints ?? 100) : 0;
    const event: ScoringEvent = { type: 'email-classified', id: e.id, points };
    addScoringEvent(event);
    setAnswers((prev) => ({ ...prev, [e.id]: label }));
    const nextIndex = emails.findIndex((item) => item.id === e.id) + 1;
    if (nextIndex < emails.length) {
      setSelectedId(emails[nextIndex].id);
    } else {
      setFinished(true);
      completeSession();
    }
  };

  if (finished) {
    return (
      <FocusedSandboxLayout title={emailContent.title} instructions={emailContent.instructions}>
        <div className="flex h-full flex-col items-center justify-center p-6 text-center">
          <h2 className="mb-2 text-2xl font-bold">Email Security Complete</h2>
          <p className="mb-6 text-lg">You correctly identified {correct} of {emails.length} emails.</p>
          <p className="mb-6 text-5xl font-bold text-blue-400">{score}</p>
          <div className="flex gap-4">
            <button
              onClick={() => startShutdown()}
              className="rounded bg-green-500 px-6 py-2 font-bold text-black hover:bg-green-400"
            >
              Finish & Exit
            </button>
            <button
              onClick={() => startReplay()}
              className="rounded bg-blue-500 px-6 py-2 font-bold text-black hover:bg-blue-400"
            >
              Replay
            </button>
          </div>
        </div>
      </FocusedSandboxLayout>
    );
  }

  return (
    <FocusedSandboxLayout title={emailContent.title} instructions={emailContent.instructions}>
      <div className="flex h-full flex-col bg-white text-gray-900">
        <div className="flex items-center border-b border-gray-200 bg-gray-50 px-3 py-2 font-semibold">
          <Inbox className="mr-2 h-4 w-4" /> Inbox ({emails.length})
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 overflow-y-auto border-r border-gray-200">
            {emails.map((email) => {
              const status = isCorrect(email.id);
              return (
                <button
                  key={email.id}
                  onClick={() => setSelectedId(email.id)}
                  className={`w-full border-b border-gray-100 px-3 py-3 text-left transition-colors ${
                    selectedId === email.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {status === true && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {status === false && <XCircle className="h-4 w-4 text-red-600" />}
                    {status === null && <Mail className="h-4 w-4 text-gray-400" />}
                    <p className="truncate text-sm font-semibold">{email.from}</p>
                  </div>
                  <p className="truncate text-sm text-blue-700">{email.subject}</p>
                  {answers[email.id] && (
                    <p className={`text-xs ${answers[email.id] === 'phishing' ? 'text-red-600' : 'text-green-600'}`}>
                      Marked {answers[email.id]}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            {selected ? (
              <>
                <div className="border-b border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        From: <span className="font-semibold text-gray-900">{selected.from}</span>
                      </p>
                      <h2 className="text-xl font-bold text-gray-900">{selected.subject}</h2>
                    </div>
                    {selected.isPhishing ? (
                      <span className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">High Risk</span>
                    ) : (
                      <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">Trusted</span>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-4 whitespace-pre-wrap">{selected.body}</div>

                {answered && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    {selected.isPhishing ? (
                      <span className="flex items-center text-red-700">
                        <ShieldAlert className="mr-1 h-4 w-4" /> This was a phishing email.
                      </span>
                    ) : (
                      <span className="flex items-center text-green-700">
                        <ShieldCheck className="mr-1 h-4 w-4" /> This was a legitimate email.
                      </span>
                    )}
                    {selected.redFlags && selected.redFlags.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-red-700">Red flags</p>
                        <ul className="list-disc space-y-0.5 pl-4 text-xs text-gray-600">
                          {selected.redFlags.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selected.explanation && (
                      <p className="mt-2 text-sm text-gray-600">{selected.explanation}</p>
                    )}
                  </div>
                )}

                <div className="flex gap-4 border-t border-gray-200 p-4">
                  <button
                    onClick={() => classify('legitimate')}
                    disabled={answered !== undefined}
                    className="flex-1 rounded bg-green-100 py-2 font-bold text-green-800 transition-colors hover:bg-green-200 disabled:opacity-60"
                  >
                    Legitimate
                  </button>
                  <button
                    onClick={() => classify('phishing')}
                    disabled={answered !== undefined}
                    className="flex-1 rounded bg-red-100 py-2 font-bold text-red-800 transition-colors hover:bg-red-200 disabled:opacity-60"
                  >
                    Phishing
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </FocusedSandboxLayout>
  );
}
