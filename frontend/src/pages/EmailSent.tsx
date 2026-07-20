import { useLocation, Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { FadeIn } from '../components/Animated';

interface EmailSentState {
  email?: string;
}

export default function EmailSent() {
  const location = useLocation();
  const state = (location.state as EmailSentState | null) || {};

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
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          {state.email ? (
            <>
              We sent a confirmation link to <strong>{state.email}</strong>. Click the link in the email to complete your sign-up and continue to onboarding.
            </>
          ) : (
            'We sent a confirmation link to your email. Click the link to complete your sign-up.'
          )}
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Did not receive it? Check your spam folder or try signing up again.
        </p>

        <div className="mt-6 text-center">
          <Link to="/" className="inline-flex items-center text-sm font-semibold text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
          </Link>
        </div>
      </FadeIn>
    </section>
  );
}
