import { useEffect, useState } from 'react';

const loadingTexts = [
  'Initializing System...',
  'Loading Components...',
  'Starting Environment...',
  'Preparing Interface...',
  'Almost Ready...',
];

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [textIndex, setTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const textInterval = setInterval(() => {
      setTextIndex((i) => (i + 1) % loadingTexts.length);
    }, 500);

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 1, 100));
    }, 30);

    const finish = setTimeout(() => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
      onComplete();
    }, 3000);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
      clearTimeout(finish);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-stock font-mono text-ink">
      <div className="dotfield absolute inset-0" aria-hidden="true" />

      <div className="z-10 flex w-full max-w-md flex-col items-center px-6">
        <div className="plate plate-strong reg-corners mb-6 flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
          <img src="/logo-bg.png" alt="Phalanx-OS" className="h-14 w-14 object-contain sm:h-16 sm:w-16" />
        </div>

        <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">Phalanx-OS</h1>
        <p className="register mb-8">Version 4.1 · Training Environment</p>

        <div className="mb-4 h-2 w-full border border-hairline bg-stock-drift">
          <div
            className="h-full bg-ink transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mb-8 flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 animate-pulse bg-ink"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        <p className="register">{loadingTexts[textIndex]}</p>
      </div>
    </div>
  );
}
