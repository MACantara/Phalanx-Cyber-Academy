import { Link } from 'react-router-dom';
import { FadeIn } from '../components/Animated';
import { Home, Shield } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stock px-5 py-20 transition-colors duration-300">
      <div className="dotfield absolute inset-0" aria-hidden="true" />
      <span className="absolute left-4 top-4 font-mono text-ink opacity-50 sm:left-6 sm:top-6" aria-hidden="true">+</span>
      <span className="absolute right-4 top-4 font-mono text-ink opacity-50 sm:right-6 sm:top-6" aria-hidden="true">+</span>
      <span className="absolute bottom-4 left-4 font-mono text-ink opacity-50 sm:bottom-6 sm:left-6" aria-hidden="true">+</span>
      <span className="absolute bottom-4 right-4 font-mono text-ink opacity-50 sm:bottom-6 sm:right-6" aria-hidden="true">+</span>

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <FadeIn>
          <span className="plate-id">ERR-404</span>
          <Shield className="mx-auto mb-6 mt-8 h-16 w-16 text-ink-soft/50" />
          <h1 className="text-7xl font-extrabold tracking-tight text-ink sm:text-8xl lg:text-9xl">404</h1>
          <h2 className="mt-4 text-2xl tracking-tight text-ink sm:text-3xl">Mission Not Found</h2>
          <p className="mt-3 text-base text-ink-soft sm:text-lg">The page you are looking for is off the grid.</p>
          <Link
            to="/"
            className="mt-8 inline-flex min-h-[44px] items-center justify-center bg-ink px-8 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink hover:text-stock dark:hover:bg-seal dark:hover:text-seal-ink"
          >
            <Home className="mr-2 h-4 w-4" /> Return to Base
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
