import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { FadeIn } from '../components/Animated';
import { useAuth } from '../context/AuthContext';

export default function ConfirmEmail() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (user.onboarding_completed) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    }
  }, [user, loading, navigate]);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 px-4 py-12 transition-colors dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-pulse rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 animate-pulse rounded-full bg-purple-400/20 blur-3xl" style={{ animationDelay: '1s' }} />
      </div>

      <FadeIn className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-2xl dark:border-gray-700 dark:bg-gray-800" delay="0.1s">
        {loading || user ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
              <Mail className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Confirming your email</h1>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Please wait while we verify your confirmation link.</p>
            <div className="mt-6 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email confirmed</h1>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Your email has been verified. Continuing to onboarding...</p>
          </>
        )}
      </FadeIn>
    </section>
  );
}
