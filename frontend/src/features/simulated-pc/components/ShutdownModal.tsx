import { useEffect, useRef } from 'react';

interface ShutdownModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export function ShutdownModal({ onCancel, onConfirm }: ShutdownModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/75 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded border border-gray-600 bg-gray-800 shadow-2xl sm:max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-600 bg-gray-700 px-4 py-3 sm:px-6 sm:py-4">
          <h3 className="text-base font-semibold text-white sm:text-lg">Shutdown Simulation</h3>
        </div>
        <div className="space-y-4 p-4 sm:p-6">
          <p className="text-sm text-gray-300 sm:text-base">
            Are you sure you want to exit the simulation?
          </p>
          <p className="text-xs text-gray-400 sm:text-sm">
            Your progress will be saved and you&apos;ll be returned to the main portal.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded border border-gray-600 bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              ref={confirmRef}
              type="button"
              onClick={onConfirm}
              className="rounded border border-green-400 bg-green-500 px-4 py-2 text-sm text-black hover:bg-green-400"
            >
              Shutdown
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
