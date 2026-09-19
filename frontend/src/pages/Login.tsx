import { Link } from 'react-router-dom';
import { SignIn } from '@clerk/react';
import { Lock, ArrowLeft } from 'lucide-react';
import { FadeIn } from '../components/Animated';

export default function Login() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 px-4 py-12 transition-colors dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-pulse rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 animate-pulse rounded-full bg-purple-400/20 blur-3xl" style={{ animationDelay: '1s' }} />
      </div>

      <FadeIn className="relative z-10 w-full max-w-md" delay="0.1s">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Log In</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Access your training dashboard</p>
        </div>

        <div className="flex justify-center">
          <SignIn
            routing="path"
            path="/login"
            signUpUrl="/signup"
            fallbackRedirectUrl="/dashboard"
            signUpFallbackRedirectUrl="/onboarding"
          />
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="inline-flex items-center text-sm font-semibold text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
          </Link>
        </div>
      </FadeIn>
    </section>
  );
}
