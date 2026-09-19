import { Link } from 'react-router-dom';
import { FadeIn } from '../components/Animated';
import { ServerOff, Home, RefreshCcw } from 'lucide-react';

export default function ServerError() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stock px-5 py-20 transition-colors duration-300">
      <div className="dotfield absolute inset-0" aria-hidden="true" />
      <span className="absolute left-4 top-4 font-mono text-ink opacity-50 sm:left-6 sm:top-6" aria-hidden="true">+</span>
      <span className="absolute right-4 top-4 font-mono text-ink opacity-50 sm:right-6 sm:top-6" aria-hidden="true">+</span>
      <span className="absolute bottom-4 left-4 font-mono text-ink opacity-50 sm:bottom-6 sm:left-6" aria-hidden="true">+</span>
      <span className="absolute bottom-4 right-4 font-mono text-ink opacity-50 sm:bottom-6 sm:right-6" aria-hidden="true">+</span>

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <FadeIn>
          <span className="plate-id">ERR-500</span>
          <ServerOff className="mx-auto mb-6 mt-8 h-16 w-16 text-strike" />
          <h1 className="text-7xl font-extrabold tracking-tight text-strike sm:text-8xl">500</h1>
          <h2 className="mt-4 text-2xl tracking-tight text-ink sm:text-3xl">Server Error</h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-ink-soft sm:text-lg">
            Something went wrong on our end. Please try again later or return to safety.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/"
              className="inline-flex min-h-[44px] items-center justify-center border border-ink px-8 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-stock-green"
            >
              <Home className="mr-2 h-4 w-4" /> Go Home
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex min-h-[44px] items-center justify-center bg-ink px-8 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink hover:text-stock dark:hover:bg-seal dark:hover:text-seal-ink"
            >
              <RefreshCcw className="mr-2 h-4 w-4" /> Retry
            </button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
