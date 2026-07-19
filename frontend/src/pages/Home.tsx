import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FadeIn, Stagger } from '../components/Animated';
import { Gamepad2, Newspaper, MailWarning, Bug, Terminal, Trophy, Zap, Shield } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-screen items-center bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 transition-colors duration-500 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
              <img src="/logo-bg.png" alt="Phalanx Cyber Academy Logo" className="mx-auto h-32 w-auto drop-shadow-2xl md:h-40 lg:h-48" />
            </div>
            <h1 className="mb-6 text-5xl font-bold text-gray-900 opacity-0 animate-fade-in-up dark:text-white md:text-7xl" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-yellow-400 dark:to-pink-400">
                Phalanx Cyber Academy
              </span>
            </h1>
            <p className="mb-4 text-2xl font-semibold text-gray-800 opacity-0 animate-fade-in-up dark:text-gray-100 md:text-3xl" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
              Train. Coordinate. Defend.
            </p>
            <p className="mx-auto mb-8 max-w-4xl text-lg leading-relaxed text-gray-600 opacity-0 animate-fade-in-up dark:text-gray-300 md:text-xl" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
              Level up your digital literacy and cybersecurity skills through gamified learning. Defend virtual networks, detect phishing attacks, and master ethical hacking in a safe, interactive environment.
            </p>
            <div className="flex flex-col justify-center gap-4 opacity-0 animate-fade-in-up sm:flex-row" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
              <Link
                to={user ? '/levels' : '/signup'}
                className="cyber-glow inline-flex transform items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:from-green-600 hover:to-emerald-700 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-green-500/25"
              >
                {user ? 'Start Learning' : 'Get Started'}
              </Link>
              <Link
                to="/about"
                className="inline-flex transform items-center justify-center rounded-xl border-2 border-gray-300 bg-white/80 px-8 py-4 text-lg font-semibold text-gray-700 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-gray-400 hover:bg-gray-100 dark:border-white/30 dark:bg-transparent dark:text-white dark:hover:border-white/50 dark:hover:bg-white/20"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute top-20 left-10 h-20 w-20 animate-bounce rounded-full bg-green-500/40 shadow-lg dark:bg-green-400/20" style={{ animationDuration: '3s', animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-10 h-16 w-16 animate-bounce rounded-full bg-blue-500/40 shadow-lg" style={{ animationDuration: '4s', animationDelay: '2s' }} />
        <div className="absolute right-1/4 top-1/3 h-12 w-12 animate-pulse rounded-full bg-purple-500/40 shadow-lg" />
      </section>

      {/* Features */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-20 transition-colors duration-300 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">Learning Features</h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300">Experience cybersecurity education through interactive gaming, real-time feedback, and realistic simulations</p>
          </FadeIn>
          <Stagger className="grid gap-8 md:grid-cols-3" baseDelay={0.1} increment={0.2}>
            <FeatureCard icon={Gamepad2} title="Gamified Learning" text="Earn XP, unlock achievements, and level up through interactive cybersecurity challenges and mini-games." color="green" />
            <FeatureCard icon={Zap} title="Real-Time Feedback" text="Receive instant feedback and adaptive guidance as you learn, with immediate corrections and personalized tips." color="blue" />
            <FeatureCard icon={Shield} title="Real Scenarios" text="Practice with realistic cybersecurity simulations including phishing detection and network defense." color="purple" />
          </Stagger>
        </div>
      </section>

      {/* Scenarios */}
      <section className="bg-gradient-to-br from-white to-gray-50 py-20 transition-colors duration-300 dark:from-gray-800 dark:to-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">Cybersecurity Game Scenarios</h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300">Level up your digital defense skills through immersive gamified cybersecurity challenges</p>
          </FadeIn>
          <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" baseDelay={0.1} increment={0.1}>
            <ScenarioCard icon={Newspaper} title="The Misinformation Maze" description="Navigate through fake news and stop misinformation from influencing an election." color="yellow" />
            <ScenarioCard icon={MailWarning} title="Shadow in the Inbox" description="Spot phishing attempts and practice safe email protocols while defending against social engineering." color="red" />
            <ScenarioCard icon={Bug} title="Malware Mayhem" description="Isolate infections and perform digital cleanup during a gaming tournament under pressure." color="purple" />
            <ScenarioCard icon={Terminal} title="The White Hat Test" description="Practice ethical hacking and responsible vulnerability disclosure in controlled scenarios." color="gray" />
            <ScenarioCard icon={Trophy} title="The Hunt for The Null" description="Use advanced digital forensics to expose The Null's identity in the ultimate cybersecurity challenge." color="blue" />
          </Stagger>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 py-20 transition-colors duration-300 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-900">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">Ready to Become a Cyber Champion?</h2>
            <p className="mx-auto mb-10 max-w-3xl text-xl text-gray-100">Join thousands of learners mastering cybersecurity through gamified experiences. Start your journey to digital safety today.</p>
          </FadeIn>
          <div className="flex flex-col justify-center gap-4 opacity-0 animate-fade-in-up sm:flex-row" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            {user ? (
              <Link to="/levels" className="inline-flex transform items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-10 py-4 text-lg font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:from-green-600 hover:to-emerald-700">Start Learning</Link>
            ) : (
              <>
                <Link to="/signup" className="inline-flex transform items-center justify-center rounded-xl bg-white px-10 py-4 text-lg font-bold text-blue-600 shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-gray-100">Get Started</Link>
                <Link to="/login" className="inline-flex transform items-center justify-center rounded-xl border-2 border-white/30 bg-transparent px-10 py-4 text-lg font-bold text-white shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white/50 hover:bg-white/20">Log in</Link>
              </>
            )}
          </div>
        </div>
        <div className="absolute left-1/4 top-10 h-32 w-32 animate-pulse rounded-full bg-green-400/10 cyber-glow" />
        <div className="absolute bottom-10 right-1/4 h-24 w-24 animate-pulse rounded-full bg-blue-400/20" style={{ animationDelay: '1s' }} />
      </section>
    </>
  );
}

function FeatureCard({ icon: Icon, title, text, color }: { icon: typeof Gamepad2; title: string; text: string; color: 'green' | 'blue' | 'purple' }) {
  const gradients = { green: 'from-green-500 to-emerald-600', blue: 'from-blue-500 to-cyan-600', purple: 'from-purple-500 to-pink-600' };
  const borders = { green: 'hover:border-green-200 dark:hover:border-green-600', blue: 'hover:border-blue-200 dark:hover:border-blue-600', purple: 'hover:border-purple-200 dark:hover:border-purple-600' };
  return (
    <div className={`group rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800 ${borders[color]}`}>
      <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${gradients[color]} text-3xl text-white shadow-lg transition-all duration-300 group-hover:rotate-3 group-hover:scale-110`}>
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">{title}</h3>
      <p className="leading-relaxed text-gray-600 dark:text-gray-300">{text}</p>
    </div>
  );
}

function ScenarioCard({ icon: Icon, title, description, color }: { icon: typeof Gamepad2; title: string; description: string; color: string }) {
  const borderColors: Record<string, string> = {
    yellow: 'hover:border-yellow-200 dark:hover:border-yellow-600',
    red: 'hover:border-red-200 dark:hover:border-red-600',
    purple: 'hover:border-purple-200 dark:hover:border-purple-600',
    gray: 'hover:border-gray-200 dark:hover:border-gray-600',
    blue: 'hover:border-blue-200 dark:hover:border-blue-600',
  };
  const gradients: Record<string, string> = {
    yellow: 'from-yellow-500 to-orange-600',
    red: 'from-red-500 to-orange-600',
    purple: 'from-purple-500 to-pink-600',
    gray: 'from-gray-700 to-gray-900',
    blue: 'from-blue-500 to-indigo-600',
  };
  return (
    <div className={`group rounded-xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 ${borderColors[color]}`}>
      <div className="mb-4 flex items-center">
        <div className={`mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${gradients[color]} text-white`}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
