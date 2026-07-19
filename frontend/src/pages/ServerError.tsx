import { Link } from 'react-router-dom';
import { FadeIn } from '../components/Animated';
import { ServerOff, Home, RefreshCcw } from 'lucide-react';

export default function ServerError() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-red-900 px-4 py-20">
      <div className="relative z-10 text-center">
        <FadeIn>
          <ServerOff className="mx-auto h-20 w-20 text-red-400" />
          <h1 className="mt-6 text-6xl font-extrabold text-white md:text-8xl">500</h1>
          <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">Server Error</h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-slate-300">
            Something went wrong on our end. Please try again later or return to safety.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl bg-slate-700 px-8 py-3 font-semibold text-white transition-all hover:bg-slate-600"
            >
              <Home className="mr-2 h-5 w-5" /> Go Home
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-xl bg-red-600 px-8 py-3 font-semibold text-white transition-all hover:bg-red-700"
            >
              <RefreshCcw className="mr-2 h-5 w-5" /> Retry
            </button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
