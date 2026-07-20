import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Mail, KeyRound } from 'lucide-react';
import { FadeIn } from '../components/Animated';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

interface VerifyLocationState {
  type?: 'login' | 'signup';
  email?: string;
}

export default function Verify() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const state = (location.state as VerifyLocationState | null) || {};
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      if (user.onboarding_completed) navigate('/dashboard');
      else navigate('/onboarding');
    }
  }, [user, loading, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.email || code.length < 6) return;
    setVerifying(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: state.email,
        token: code,
        type: 'email',
      });
      if (error) throw error;
      showToast('Verification successful.', 'success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired code');
      setVerifying(false);
    }
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 px-4 py-12 transition-colors dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-pulse rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 animate-pulse rounded-full bg-purple-400/20 blur-3xl" style={{ animationDelay: '1s' }} />
      </div>

      <FadeIn className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-2xl dark:border-gray-700 dark:bg-gray-800" delay="0.1s">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
          <Mail className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Check your email</h1>
        {state.email ? (
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            We sent a {state.type === 'signup' ? 'sign-up' : 'sign-in'} verification code to <strong>{state.email}</strong>. Enter the 6-digit code below to continue.
          </p>
        ) : (
          <p className="mt-4 text-red-600 dark:text-red-400">Missing email address. Return to the login page and try again.</p>
        )}

        {state.email && (
          <form onSubmit={handleVerify} className="mt-6 space-y-4">
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
                disabled={verifying || loading}
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-center text-2xl tracking-[0.5em] text-gray-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={code.length < 6 || verifying || loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {verifying || loading ? (
                <span className="inline-flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                </span>
              ) : (
                'Verify Code'
              )}
            </button>

            {errorMessage && (
              <div className="rounded-lg border border-red-400 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                {errorMessage}
              </div>
            )}
          </form>
        )}
      </FadeIn>
    </section>
  );
}