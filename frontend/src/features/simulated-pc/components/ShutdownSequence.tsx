import { useEffect, useState } from 'react';

const shutdownLines = [
  { text: 'Initiating secure shutdown sequence...', type: 'info', delay: 30 },
  { text: 'Saving user session data', type: 'info', delay: 40, hasStatus: true, status: '[  OK  ]' },
  { text: 'Closing active applications', type: 'info', delay: 30, hasStatus: true, status: '[  OK  ]' },
  { text: '', type: 'info', delay: 10 },
  { text: 'Securing sensitive training data', type: 'warning', delay: 50, hasStatus: true, status: '[  OK  ]' },
  { text: 'Clearing temporary security logs', type: 'info', delay: 30, hasStatus: true, status: '[  OK  ]' },
  { text: 'Encrypting session artifacts', type: 'info', delay: 40, hasStatus: true, status: '[  OK  ]' },
  { text: '', type: 'info', delay: 10 },
  { text: 'Stopping security services', type: 'success', delay: 40, hasStatus: true, status: '[  OK  ]' },
  { text: 'Stopping Network Manager', type: 'success', delay: 20 },
  { text: 'Stopping Firewall Protection', type: 'success', delay: 20 },
  { text: 'Stopping Intrusion Detection System', type: 'success', delay: 20 },
  { text: 'Stopping Security Monitor Service', type: 'success', delay: 20 },
  { text: '', type: 'info', delay: 10 },
  { text: 'Finalizing training session data', type: 'info', delay: 40, hasStatus: true, status: '[  OK  ]' },
  { text: 'Uploading progress to secure cloud storage', type: 'info', delay: 60, hasStatus: true, status: '[  OK  ]' },
  { text: 'Verifying data integrity', type: 'info', delay: 30, hasStatus: true, status: '[  OK  ]' },
  { text: '', type: 'info', delay: 30 },
  { text: 'Thank you for training with Phalanx Cyber Academy', type: 'success', delay: 50 },
  { text: 'Your progress has been securely saved', type: 'info', delay: 30 },
  { text: 'System shutdown complete', type: 'success', delay: 40 },
  { text: '', type: 'info', delay: 100 },
];

export function ShutdownSequence({ onComplete }: { onComplete: () => void }) {
  const [lines, setLines] = useState<{ text: string; type: string; status?: string }[]>([]);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      for (const line of shutdownLines) {
        if (cancelled) return;
        await new Promise((resolve) => setTimeout(resolve, line.delay));
        if (line.text === '') {
          setLines((prev) => [...prev, { text: '', type: line.type }]);
          continue;
        }
        if (line.hasStatus && line.status) {
          setLines((prev) => [...prev, { text: line.text, type: line.type }]);
          await new Promise((resolve) => setTimeout(resolve, 80));
          setLines((prev) => {
            const next = [...prev];
            next[next.length - 1] = { text: line.text, type: line.type, status: line.status };
            return next;
          });
        } else {
          setLines((prev) => [...prev, { text: line.text, type: line.type }]);
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
      setFade(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (!cancelled) onComplete();
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [onComplete]);

  const colorClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-green-400';
    }
  };

  return (
    <div className={`fixed inset-0 overflow-y-auto bg-black p-6 font-mono text-sm leading-relaxed transition-opacity duration-1000 sm:p-10 ${fade ? 'opacity-0' : 'opacity-100'}`}>
      {lines.map((line, i) => (
        <div key={i} className={`mb-0.5 whitespace-pre-wrap ${colorClass(line.type)}`}>
          {line.text}
          {line.status && <span className="ml-4 font-bold">{line.status}</span>}
        </div>
      ))}
    </div>
  );
}
