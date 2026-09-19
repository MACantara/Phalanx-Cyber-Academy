import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const edge = {
  success: 'border-l-confirm text-confirm',
  error: 'border-l-strike text-strike',
  warning: 'border-l-strike text-strike',
  info: 'border-l-seal-ink text-seal-ink',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-[100] flex max-w-sm flex-col gap-3">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-center justify-between border border-hairline border-l-2 bg-stock p-4 text-sm ${edge[toast.type]} animate-slide-in-right`}
          >
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium text-ink">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-lg font-bold hover:scale-110"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
