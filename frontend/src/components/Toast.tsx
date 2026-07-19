import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const styles = {
  success: 'border-green-200 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/90 dark:text-green-200',
  error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/90 dark:text-red-200',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/90 dark:text-yellow-200',
  info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900/90 dark:text-blue-200',
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
            className={`flex items-center justify-between rounded-xl p-4 text-sm shadow-lg ${styles[toast.type]} animate-slide-in-right`}
          >
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{toast.message}</span>
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
