import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FadeIn } from '../components/Animated';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, ShieldCheck, Key, Info, Clock, Loader2 } from 'lucide-react';

interface VerifyLocationState {
  type?: 'login' | 'signup';
  email?: string;
  signupData?: {
    email: string;
    username: string;
    timezone: string;
    cybersecurity_experience: string;
  };
}

export default function Verify() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { showToast } = useToast();
  const state = (location.state as VerifyLocationState | null) || {};
  const codeType = state.type === 'signup' ? 'signup' : 'login';
  const email = state.email || '';
  const signupData = state.signupData;

  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isSignup = codeType === 'signup';
  const accent = isSignup
    ? {
        iconBg: 'from-green-500 to-emerald-600',
        icon: Mail,
        label: 'text-green-600 dark:text-green-400',
        border: 'border-green-300 dark:border-green-500/30',
        focus: 'focus:border-green-500 focus:ring-green-500/50',
        filledBg: 'bg-green-50 dark:bg-green-900/30',
        filledBorder: 'border-green-500',
        filledRing: 'ring-green-500/50',
        dotActive: 'bg-green-500 dark:bg-green-400 scale-125',
        dotInactive: 'bg-green-200 dark:bg-green-800',
        button: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:ring-green-500/25',
        titleAccent: 'from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400',
        infoBg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/30 text-blue-800 dark:text-blue-300',
      }
    : {
        iconBg: 'from-blue-500 to-cyan-600',
        icon: ShieldCheck,
        label: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-300 dark:border-blue-500/30',
        focus: 'focus:border-blue-500 focus:ring-blue-500/50',
        filledBg: 'bg-blue-50 dark:bg-blue-900/30',
        filledBorder: 'border-blue-500',
        filledRing: 'ring-blue-500/50',
        dotActive: 'bg-blue-500 dark:bg-blue-400 scale-125',
        dotInactive: 'bg-blue-200 dark:bg-blue-800',
        button: 'from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 focus:ring-blue-500/25',
        titleAccent: 'from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400',
        infoBg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-500/30 text-yellow-800 dark:text-yellow-300',
      };

  const Icon = accent.icon;

  useEffect(() => {
    if (email) {
      inputRefs.current[0]?.focus();
    }
  }, [email]);

  const code = digits.join('');

  const updateDigit = (index: number, value: string) => {
    const sanitized = value.replace(/\D/g, '').slice(0, 1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = sanitized;
      return next;
    });
    if (sanitized && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    return sanitized;
  };

  const handleInput = (index: number, value: string) => {
    const sanitized = updateDigit(index, value);
    const nextIndex = sanitized && index < 5 ? index + 1 : index;
    if (nextIndex === index && !sanitized) {
      inputRefs.current[index]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const prev = inputRefs.current[index - 1];
      if (prev) {
        prev.value = '';
        setDigits((d) => {
          const next = [...d];
          next[index - 1] = '';
          return next;
        });
        prev.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const next = [...digits];
    text.split('').forEach((char, i) => {
      if (i < 6) next[i] = char;
    });
    setDigits(next);
    const focusIndex = Math.min(text.length, 5);
    setTimeout(() => inputRefs.current[focusIndex]?.focus(), 0);
    if (text.length === 6) {
      setTimeout(() => submit(next.join('')), 200);
    }
  };

  const submit = async (codeToSubmit: string) => {
    if (codeToSubmit.length !== 6) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      const firstEmpty = digits.findIndex((d) => !d);
      const target = firstEmpty !== -1 ? firstEmpty : 0;
      inputRefs.current[target]?.focus();
      return;
    }

    if (!email) return;

    setLoading(true);
    try {
      const res = isSignup
        ? await api.post('/auth/verify-signup', { ...signupData, code: codeToSubmit })
        : await api.post('/auth/verify', { email, code: codeToSubmit, code_type: 'login' });
      const user = res.data.user;
      setUser(user);
      showToast(`Welcome${user.username ? `, ${user.username}` : ' back'}!`, 'success');
      navigate(user.onboarding_completed ? '/dashboard' : '/onboarding');
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Invalid or expired code', 'error');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(code);
  };

  const triggerAutoSubmit = (nextCode: string) => {
    if (nextCode.length === 6) {
      setTimeout(() => submit(nextCode), 200);
    }
  };

  const onChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleInput(index, value);
    if (value.replace(/\D/g, '').length === 1) {
      const updated = [...digits];
      updated[index] = value.replace(/\D/g, '').slice(0, 1);
      triggerAutoSubmit(updated.join(''));
    }
  };

  if (!email) {
    return (
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 px-4 py-12 transition-colors dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <FadeIn className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-2xl dark:border-gray-700 dark:bg-gray-800" delay="0.1s">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ready to Verify</h1>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            No email to verify.{' '}
            <Link to="/signup" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">Sign up</Link>
            {' or '}
            <Link to="/login" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">Log in</Link>.
          </p>
        </FadeIn>
      </section>
    );
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 px-4 py-12 transition-colors dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-pulse rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 animate-pulse rounded-full bg-purple-400/20 blur-3xl" style={{ animationDelay: '1s' }} />
      </div>

      <FadeIn className="relative z-10 w-full max-w-md" delay="0.1s">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="mb-6 text-center">
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r ${accent.iconBg} text-white shadow-lg`}>
              <Icon className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isSignup ? (
                <>
                  Verify Your{' '}
                  <span className={`bg-gradient-to-r ${accent.titleAccent} bg-clip-text text-transparent`}>Email</span>
                </>
              ) : (
                <>
                  Enter Verification{' '}
                  <span className={`bg-gradient-to-r ${accent.titleAccent} bg-clip-text text-transparent`}>Code</span>
                </>
              )}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">We've sent a 6-digit code to:</p>
            <p className={`mt-1 font-mono text-sm ${accent.label}`}>{email}</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className={`mb-4 flex items-center justify-center text-sm font-semibold ${accent.label}`}>
                <Key className="mr-2 h-4 w-4" /> Verification Code
              </label>

              <div className={`flex justify-center gap-2 ${shake ? 'animate-shake' : ''}`}>
                {digits.map((digit, i) => {
                  const filled = Boolean(digit);
                  return (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => onChange(i, e)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onPaste={handlePaste}
                      disabled={loading}
                      aria-label={`Digit ${i + 1}`}
                      className={`h-14 w-12 rounded-xl border-2 bg-gray-50 text-center text-2xl font-bold text-gray-900 transition-all outline-none dark:bg-gray-700/50 dark:text-white ${accent.border} ${accent.focus} ${
                        filled ? `${accent.filledBg} ${accent.filledBorder} ring-2 ${accent.filledRing} scale-105` : ''
                      }`}
                    />
                  );
                })}
              </div>

              <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">Enter the 6-digit code from your email</p>

              <div className="mt-3 flex justify-center gap-1">
                {digits.map((digit, i) => (
                  <div
                    key={i}
                    className={`h-2 w-2 rounded-full transition-all ${digit ? accent.dotActive : accent.dotInactive}`}
                  />
                ))}
              </div>
            </div>

            <div className={`rounded-xl border p-4 ${accent.infoBg}`}>
              <div className="flex items-start">
                {isSignup ? <Info className="mr-3 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" /> : <Clock className="mr-3 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />}
                <p className="text-sm">
                  {isSignup ? (
                    <>
                      <strong>Next Steps</strong><br />
                      After verification, you'll complete your profile setup with a username and experience level.
                    </>
                  ) : (
                    <>
                      <strong>Code expires in 15 minutes</strong><br />
                      You have up to 5 attempts to enter the correct code.
                    </>
                  )}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className={`group inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r ${accent.button} px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:shadow-2xl focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...
                </>
              ) : (
                <>{isSignup ? 'Verify Email' : 'Verify & Login'}</>
              )}
            </button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-300">
              Didn't receive the code?{' '}
              <Link
                to={isSignup ? '/signup' : '/login'}
                className={`font-medium ${accent.label} hover:underline`}
              >
                {isSignup ? 'Back to Signup' : 'Back to Login'}
              </Link>
            </p>
          </div>
        </form>
      </FadeIn>
    </section>
  );
}

