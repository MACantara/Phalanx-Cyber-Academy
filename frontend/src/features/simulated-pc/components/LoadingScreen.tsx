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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-black font-mono text-green-400">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      <div className="z-10 flex w-full max-w-md flex-col items-center px-6">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded border-2 border-gray-600 bg-gray-700 shadow-2xl sm:h-28 sm:w-28">
          <div className="animate-pulse text-3xl text-green-400 sm:text-4xl">🛡️</div>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-white sm:text-5xl">CyberOS</h1>
        <p className="mb-8 text-sm text-gray-400 sm:text-base">Version 2.1.0</p>

        <div className="mb-4 h-2 w-full overflow-hidden rounded border border-gray-600 bg-gray-700">
          <div
            className="h-full bg-green-400 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mb-8 flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-3 w-3 animate-bounce rounded-full bg-green-400"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>

        <p className="text-lg text-green-400">{loadingTexts[textIndex]}</p>
      </div>
    </div>
  );
}
