import { useEffect, useState } from 'react';

const bootLines = [
  { text: 'Phalanx Cyber Academy Security Training Environment v2.1.0', type: 'info', delay: 30 },
  { text: 'Copyright (c) 2025 Phalanx Cyber Academy Training Systems', type: 'info', delay: 30 },
  { text: '', type: 'info', delay: 10 },
  { text: 'Initializing secure training environment', type: 'info', delay: 50, hasStatus: true, status: '[  OK  ]' },
  { text: 'Loading kernel modules and core services', type: 'info', delay: 60, hasStatus: true, status: '[  OK  ]' },
  { text: '', type: 'info', delay: 10 },
  { text: 'Starting security services', type: 'success', delay: 40, hasStatus: true, status: '[  OK  ]' },
  { text: 'Loading Network Manager', type: 'success', delay: 20 },
  { text: 'Loading Firewall Protection', type: 'success', delay: 20 },
  { text: 'Loading Intrusion Detection System', type: 'success', delay: 20 },
  { text: 'Loading Security Monitor Service', type: 'success', delay: 20 },
  { text: 'Scanning for network devices', type: 'warning', delay: 50, hasStatus: true, status: '[ WARN ]' },
  { text: 'Running security scan', type: 'success', delay: 40, hasStatus: true, status: '[  OK  ]' },
  { text: '', type: 'info', delay: 10 },
  { text: 'Preparing training environment', type: 'info', delay: 40, hasStatus: true, status: '[  OK  ]' },
  { text: 'Loading scenario data', type: 'info', delay: 20 },
  { text: 'Preparing virtual environment', type: 'info', delay: 20 },
  { text: 'Finalizing training setup', type: 'success', delay: 30 },
  { text: '', type: 'info', delay: 30 },
  { text: 'Welcome to the Phalanx Cyber Academy Training Lab', type: 'success', delay: 50 },
  { text: 'Type "help" for available commands', type: 'info', delay: 30 },
  { text: '', type: 'info', delay: 100 },
];

export function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [lines, setLines] = useState<{ text: string; type: string; status?: string }[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      for (let i = 0; i < bootLines.length; i++) {
        if (cancelled) return;
        const line = bootLines[i];
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
      await new Promise((resolve) => setTimeout(resolve, 300));
      setDone(true);
      onComplete();
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
    <div className="fixed inset-0 overflow-y-auto bg-black p-6 font-mono text-sm leading-relaxed text-green-400 sm:p-10">
      {lines.map((line, i) => (
        <div key={i} className={`mb-0.5 whitespace-pre-wrap ${colorClass(line.type)}`}>
          {line.text}
          {line.status && <span className="ml-4 font-bold">{line.status}</span>}
        </div>
      ))}
      {done && <span className="inline-block h-4 w-2 animate-pulse bg-green-400" />}
      {!done && <span className="inline-block h-4 w-2 animate-pulse bg-green-400" />}
    </div>
  );
}
