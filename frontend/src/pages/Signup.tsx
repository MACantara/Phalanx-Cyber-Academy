import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, ArrowLeft } from 'lucide-react';
import { FadeIn } from '../components/Animated';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

export default function Signup() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tempPassword = generateTempPassword();
      const { error } = await supabase.auth.signUp({
        email,
        password: tempPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/confirm-email`,
        },
      });
      if (error) throw error;
      navigate('/email-sent', { state: { email } });
    } catch (err: any) {
      const msg = err.message || 'Failed to create account';
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) {
        showToast('An account with this email already exists. Please log in.', 'error');
      } else {
        showToast(msg, 'error');
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
            <User className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sign Up</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Create a free account and start training</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
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
              {loading ? 'Sending...' : 'Create Account'}
            </button>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account? <Link to="/login" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">Log in</Link>
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

function generateTempPassword() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(36)).join('').slice(0, 24);
  }
  return Math.random().toString(36).slice(2, 26);
}

function Field({
  label,
  id,
  type,
  icon: Icon,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  id: string;
  type: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative mt-2">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
        />
      </div>
    </div>
  );
}