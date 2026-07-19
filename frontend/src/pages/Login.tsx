import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { FadeIn } from '../components/Animated';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockoutMessage, setLockoutMessage] = useState<string | null>(null);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLockoutMessage(null);
    try {
      await api.post('/auth/login', { email });
      showToast('Verification code sent to your email.', 'success');
      navigate('/verify', { state: { type: 'login', email } });
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Failed to send login code';
      if (err.response?.status === 429) {
        setLockoutMessage(detail);
      } else {
        showToast(detail, 'error');
      }
      setLoading(false);
    }
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 px-4 py-12 transition-colors dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-pulse rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 animate-pulse rounded-full bg-purple-400/20 blur-3xl" style={{ animationDelay: '1s' }} />
      </div>

      <FadeIn className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl dark:border-gray-700 dark:bg-gray-800" delay="0.1s">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Log In</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Passwordless access to your training dashboard</p>
        </div>

        <form onSubmit={handleRequestCode} className="space-y-5">
          <Field
            label="Email Address"
            id="email"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send Login Code'}
          </button>
          {lockoutMessage && (
            <div className="rounded-lg border border-red-400 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
              {lockoutMessage}
            </div>
          )}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            No account? <Link to="/signup" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">Sign up</Link>
          </p>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="inline-flex items-center text-sm font-semibold text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
          </Link>
        </div>
      </FadeIn>
    </section>
  );
}

function Field({
  label,
  id,
  type,
  icon: Icon,
  value,
  onChange,
  placeholder,
  inputMode,
  hint,
  code,
  required,
}: {
  label: string;
  id: string;
  type: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
  hint?: string;
  code?: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      {hint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
      <div className="relative mt-2">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 text-gray-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 ${code ? 'pr-4 text-center text-2xl tracking-[0.5em]' : 'pr-4'}`}
        />
      </div>
    </div>
  );
}
