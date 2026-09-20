import { useEffect, useState } from 'react';
import { useSimulatedPC } from '../context/SimulatedPCContext';

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
  const { formFactor } = useSimulatedPC();
  const [lines, setLines] = useState<{ text: string; type: string; status?: string }[]>([]);

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
        return 'text-confirm';
      case 'warning':
        return 'text-strike';
      case 'error':
        return 'text-strike';
      default:
        return 'text-ink-soft';
    }
  };

  if (formFactor === 'handset') {
    const progress = Math.round((lines.length / bootLines.length) * 100);
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-stock p-6 font-mono">
        <div className="plate w-full max-w-xs border-ink p-6 text-center">
          <img src="/logo.png" alt="Phalanx" className="mx-auto h-14 w-14 object-contain" />
          <div className="register mt-3">PHALANX-OS · MOBILE</div>
          <div className="mt-4 h-px w-full bg-hairline">
            <div className="h-px bg-ink transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-4 min-h-[4.5rem] space-y-1 text-left text-[10px] leading-snug text-ink-soft">
            {lines.slice(-4).map((line, i) =>
              line.text ? (
                <div key={i} className="truncate">
                  {line.text}
                  {line.status && <span className="ml-2 font-bold text-confirm">{line.status}</span>}
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-y-auto bg-stock p-6 font-mono text-[13px] leading-relaxed sm:p-10">
      <div className="mb-6 border-b border-ink pb-3">
        <div className="text-[10px] uppercase tracking-[0.2em] text-ink">PHALANX-OS 4.1 · Plate Register</div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-ink-soft">Session · Scenario load sequence</div>
      </div>
      {lines.map((line, i) => (
        <div key={i} className={`mb-0.5 whitespace-pre-wrap ${colorClass(line.type)}`}>
          {line.text}
          {line.status && <span className="ml-4 font-bold text-confirm">{line.status}</span>}
        </div>
      ))}
      <span className="inline-block h-4 w-2 animate-pulse bg-ink" />
    </div>
  );
}
