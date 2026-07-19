import { useState } from 'react';
import { useSimulatedPC } from '../context/SimulatedPCContext';
import { Inbox, Mail, ShieldCheck, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

interface EmailItem {
  id: string | number;
  sender?: string;
  from?: string;
  subject?: string;
  body?: string;
  is_phishing?: number;
  phishing?: boolean;
  ai_analysis?: {
    risk_level?: string;
    educational_focus?: string;
    red_flags?: string[];
    safety_factors?: string[];
    verification_tips?: string[];
  };
}

const trainingEmails: EmailItem[] = [
  {
    id: 1,
    from: 'IT Security',
    subject: 'Weekly Security Tip',
    body: 'Always verify links before clicking.',
    phishing: false,
  },
  {
    id: 2,
    from: 'Phalanx Ops',
    subject: 'Mission Briefing',
    body: 'New training scenarios are available.',
    phishing: false,
  },
  {
    id: 3,
    from: 'Admin',
    subject: 'System Maintenance',
    body: 'Scheduled maintenance window tonight.',
    phishing: false,
  },
];

export function EmailApp() {
  const { content, completeSession } = useSimulatedPC();

  const rawEmails = (content?.data?.emails as EmailItem[]) ?? trainingEmails;
  const emails = rawEmails.map((e) => ({
    ...e,
    id: e.id,
    from: e.from ?? e.sender ?? 'Unknown Sender',
    subject: e.subject ?? 'No Subject',
    body: e.body ?? 'No Body',
    isPhishing: typeof e.phishing === 'boolean' ? e.phishing : e.is_phishing === 1,
  }));

  const [selectedId, setSelectedId] = useState<string | number>(emails[0]?.id ?? 0);
  const [answers, setAnswers] = useState<Record<string | number, 'phishing' | 'legitimate'>>({});
  const [showFinished, setShowFinished] = useState(false);

  const selected = emails.find((e) => e.id === selectedId) ?? emails[0];
  const answered = selected ? answers[selected.id] : undefined;
  const correct = emails.filter((e) => (e.isPhishing ? 'phishing' : 'legitimate') === answers[e.id]).length;
  const score = emails.length ? Math.round((correct / emails.length) * 100) : 0;

  const classify = (label: 'phishing' | 'legitimate') => {
    if (!selected) return;
    setAnswers((prev) => ({ ...prev, [selected.id]: label }));
    const nextIndex = emails.findIndex((e) => e.id === selected.id) + 1;
    if (nextIndex < emails.length) {
      setSelectedId(emails[nextIndex].id);
    } else {
      setShowFinished(true);
    }
  };

  const isCorrect = (id: string | number) => {
    const e = emails.find((item) => item.id === id);
    if (!e || answers[id] === undefined) return null;
    return (e.isPhishing ? 'phishing' : 'legitimate') === answers[id];
  };

  if (showFinished) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-gray-50 p-6 text-center text-gray-900">
        <h2 className="mb-2 text-2xl font-bold">Email Security Complete</h2>
        <p className="mb-6 text-lg">
          You correctly identified {correct} of {emails.length} emails.
        </p>
        <p className="mb-6 text-5xl font-bold text-blue-700">{score}%</p>
        <button
          onClick={() => completeSession(score)}
          className="rounded bg-green-500 px-6 py-2 font-bold text-black hover:bg-green-400"
        >
          Finish & Exit
        </button>
      </div>
    );
  }

  return (
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
                  {selected.ai_analysis ? (
                    <>
                      <p className="mb-2 text-sm font-semibold text-gray-700">{selected.ai_analysis.educational_focus}</p>
                      {selected.ai_analysis.red_flags && selected.ai_analysis.red_flags.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-semibold text-red-700">Red flags</p>
                          <ul className="list-disc space-y-0.5 pl-4 text-xs text-gray-600">
                            {selected.ai_analysis.red_flags.map((f, i) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selected.ai_analysis.verification_tips && selected.ai_analysis.verification_tips.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-green-700">Verification tips</p>
                          <ul className="list-disc space-y-0.5 pl-4 text-xs text-gray-600">
                            {selected.ai_analysis.verification_tips.map((t, i) => (
                              <li key={i}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-600">
                      {selected.isPhishing ? (
                        <span className="flex items-center text-red-700">
                          <ShieldAlert className="mr-1 h-4 w-4" /> This was a phishing email.
                        </span>
                      ) : (
                        <span className="flex items-center text-green-700">
                          <ShieldCheck className="mr-1 h-4 w-4" /> This was a legitimate email.
                        </span>
                      )}
                    </p>
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
          ) : (
            <div className="flex flex-1 items-center justify-center text-gray-500">No email selected</div>
          )}
        </div>
      </div>
    </div>
  );
}
