import { Link } from 'react-router-dom';
import { FadeIn } from '../components/Animated';
import { Home, Shield } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 px-4 py-20">
      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <FadeIn>
          <Shield className="mx-auto mb-6 h-24 w-24 text-white/20" />
          <h1 className="text-8xl font-bold text-white">404</h1>
          <h2 className="mt-4 text-3xl font-bold text-white">Mission Not Found</h2>
          <p className="mt-2 text-xl text-gray-300">The page you are looking for is off the grid.</p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center rounded-xl bg-white px-8 py-3 font-semibold text-indigo-600 shadow-lg transition-all hover:bg-gray-100"
          >
            <Home className="mr-2 h-5 w-5" /> Return to Base
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
