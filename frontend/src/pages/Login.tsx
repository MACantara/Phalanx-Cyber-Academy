import { Link } from 'react-router-dom';
import { SignIn } from '@clerk/react';
import { Lock, ArrowLeft } from 'lucide-react';
import { FadeIn } from '../components/Animated';

export default function Login() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stock px-5 py-14 sm:px-8 sm:py-20">
      <div className="dotfield absolute inset-0" aria-hidden="true" />
      <span className="absolute left-4 top-4 font-mono text-ink opacity-50 sm:left-6 sm:top-6" aria-hidden="true">+</span>
      <span className="absolute right-4 top-4 font-mono text-ink opacity-50 sm:right-6 sm:top-6" aria-hidden="true">+</span>
      <span className="absolute bottom-4 left-4 font-mono text-ink opacity-50 sm:bottom-6 sm:left-6" aria-hidden="true">+</span>
      <span className="absolute bottom-4 right-4 font-mono text-ink opacity-50 sm:bottom-6 sm:right-6" aria-hidden="true">+</span>

      <FadeIn className="relative z-10 w-full max-w-md" delay="0.1s">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center bg-seal text-seal-ink">
            <Lock className="h-6 w-6" />
          </div>
          <span className="register">Credential Check — Access</span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Log In</h1>
          <p className="mt-2 text-ink-soft">Access your training dashboard</p>
        </div>

        <div className="my-7 border-t border-hairline" aria-hidden="true" />

        <div className="flex justify-center">
          <SignIn
            routing="path"
            path="/login"
            signUpUrl="/signup"
            fallbackRedirectUrl="/dashboard"
            signUpFallbackRedirectUrl="/onboarding"
          />
        </div>

        <div className="mt-7 border-t border-hairline pt-6 text-center">
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft transition-colors hover:text-seal-ink"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </div>
      </FadeIn>
    </section>
  );
}
