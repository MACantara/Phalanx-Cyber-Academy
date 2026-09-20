import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FadeIn, Stagger } from '../components/Animated';
import { Monitor, Newspaper, MailWarning, Bug, Terminal, Trophy, Stamp, type LucideIcon } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      {/* Hero — registered mark + certification stamp on stock */}
      <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-stock transition-colors duration-300">
        <div className="dotfield absolute inset-0" aria-hidden="true" />
        <span className="absolute left-4 top-4 font-mono text-ink opacity-50 sm:left-6 sm:top-6" aria-hidden="true">+</span>
        <span className="absolute right-4 top-4 font-mono text-ink opacity-50 sm:right-6 sm:top-6" aria-hidden="true">+</span>
        <span className="absolute bottom-4 left-4 font-mono text-ink opacity-50 sm:bottom-6 sm:left-6" aria-hidden="true">+</span>
        <span className="absolute bottom-4 right-4 font-mono text-ink opacity-50 sm:bottom-6 sm:right-6" aria-hidden="true">+</span>

        <div className="relative z-10 mx-auto max-w-6xl px-5 py-16 text-center sm:px-8 sm:py-20">
          <div className="relative mx-auto mb-8 w-fit opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <img src="/logo-bg.png" alt="Phalanx Cyber Academy shield logo" className="h-28 w-auto sm:h-36 lg:h-44" />
            <svg
              className="absolute -bottom-5 -right-8 h-20 w-20 animate-[stamp-spin_25s_linear_infinite] sm:h-24 sm:w-24"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <defs>
                <path id="stampRing" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" />
              </defs>
              <circle cx="50" cy="50" r="47" className="fill-ink opacity-90" />
              <text className="fill-stock font-mono" fontSize="8.4" letterSpacing="1.6">
                <textPath href="#stampRing">PHALANX · CYBER · ACADEMY · EST · MMXXVI ·</textPath>
              </text>
            </svg>
          </div>

          <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-ink opacity-0 animate-fade-in-up sm:text-6xl lg:text-7xl" style={{ animationDelay: '0.35s', animationFillMode: 'forwards' }}>
            Phalanx Cyber Academy
          </h1>
          <p className="mb-4 text-xl font-semibold text-ink opacity-0 animate-fade-in-up sm:text-2xl" style={{ animationDelay: '0.45s', animationFillMode: 'forwards' }}>
            Train. Coordinate. Defend.
          </p>
          <p className="mx-auto mb-9 max-w-3xl text-base leading-relaxed text-ink-soft opacity-0 animate-fade-in-up sm:text-lg" style={{ animationDelay: '0.55s', animationFillMode: 'forwards' }}>
            A training academy for digital defense. Missions play out inside a simulated workstation: phishing inboxes, misinformation feeds, malware outbreaks. Make the calls, earn the marks.
          </p>
          <div className="flex flex-col justify-center gap-4 opacity-0 animate-fade-in-up sm:flex-row" style={{ animationDelay: '0.65s', animationFillMode: 'forwards' }}>
            <Link
              to={user ? '/levels' : '/signup'}
              className="inline-flex min-h-[44px] items-center justify-center bg-ink px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink hover:text-stock dark:hover:bg-seal dark:hover:text-seal-ink"
            >
              {user ? 'Open Missions' : 'Enlist'}
            </Link>
            <Link
              to="/about"
              className="inline-flex min-h-[44px] items-center justify-center border border-ink px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-stock-green"
            >
              About the Academy
            </Link>
          </div>
        </div>
      </section>

      {/* Features — plate cards */}
      <section className="border-t border-hairline py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <FadeIn className="mb-12 text-center">
            <span className="register">Plate 02 — Field Training</span>
            <h2 className="mb-4 mt-3 text-3xl tracking-tight text-ink sm:text-4xl lg:text-5xl">Field Training</h2>
            <p className="mx-auto max-w-3xl text-ink-soft sm:text-lg">Missions inside a simulated workstation, with a verdict on every call.</p>
          </FadeIn>
          <Stagger className="grid gap-6 md:grid-cols-3" baseDelay={0.1} increment={0.15}>
            <FeatureCard code="FTR-01" icon={Monitor} title="Simulated Workstation" text="Missions run inside a full PC environment: mail, browser, files, and case apps sharing one world." />
            <FeatureCard code="FTR-02" icon={Stamp} title="Verdicts" text="Every call lands a verdict with the reasoning attached, scored per decision." />
            <FeatureCard code="FTR-03" icon={Trophy} title="The Record" text="XP, badges, streaks, and a session report per mission. The leaderboard keeps standing." />
          </Stagger>
        </div>
      </section>

      {/* Scenarios — mission register */}
      <section className="border-t border-hairline py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <FadeIn className="mb-12 text-center">
            <span className="register">Plate 03 — Scenario Register</span>
            <h2 className="mb-4 mt-3 text-3xl tracking-tight text-ink sm:text-4xl lg:text-5xl">Scenario Register</h2>
            <p className="mx-auto max-w-3xl text-ink-soft sm:text-lg">Missions ordered by difficulty. Each is a scored exercise inside the simulated PC.</p>
          </FadeIn>
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" baseDelay={0.1} increment={0.1}>
            <ScenarioCard code="MSN-01" icon={Newspaper} title="The Misinformation Maze" description="Sort credible reporting from fake news with an election on the line." diff="Intermediate" />
            <ScenarioCard code="MSN-02" icon={MailWarning} title="Shadow in the Inbox" description="Work the inbox. Flag the phish before the credentials walk out." diff="Beginner" />
            <ScenarioCard code="MSN-03" icon={Bug} title="Malware Mayhem" description="Isolate the infection and clean the machine while the tournament clock runs." diff="Intermediate" />
            <ScenarioCard code="MSN-04" icon={Terminal} title="The White Hat Test" description="Run a controlled intrusion, then disclose what you find the right way." diff="Advanced" />
            <ScenarioCard code="MSN-05" icon={Trophy} title="The Hunt for The Null" description="Follow the forensic evidence to unmask The Null." diff="Advanced" />
          </Stagger>
        </div>
      </section>

      {/* CTA — inverted plate */}
      <section className="border-t border-hairline bg-ink py-14 text-stock sm:py-20">
        <div className="mx-auto max-w-6xl px-5 text-center sm:px-8">
          <FadeIn>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-stock/70">Final Plate — Enlistment</span>
            <h2 className="mb-4 mt-3 text-3xl tracking-tight sm:text-4xl lg:text-5xl">Report for Training</h2>
            <p className="mx-auto mb-10 max-w-3xl text-stock/80 sm:text-lg">Create an account, clear intake, and take your first mission.</p>
          </FadeIn>
          <div className="flex flex-col justify-center gap-4 opacity-0 animate-fade-in-up sm:flex-row" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
            {user ? (
              <Link to="/levels" className="inline-flex min-h-[44px] items-center justify-center bg-stock px-10 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-seal">
                Open Missions
              </Link>
            ) : (
              <>
                <Link to="/signup" className="inline-flex min-h-[44px] items-center justify-center bg-stock px-10 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-seal">
                  Enlist
                </Link>
                <Link to="/login" className="inline-flex min-h-[44px] items-center justify-center border border-stock/50 px-10 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:border-stock hover:bg-stock/10">
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureCard({ code, icon: Icon, title, text }: { code: string; icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="plate reg-corners group p-6 text-center transition-colors hover:border-ink sm:p-8">
      <span className="plate-id absolute left-3 top-3">{code}</span>
      <div className="mx-auto mb-6 mt-4 flex h-16 w-16 items-center justify-center bg-seal text-seal-ink">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mb-3 text-xl font-bold text-ink">{title}</h3>
      <p className="leading-relaxed text-ink-soft">{text}</p>
    </div>
  );
}

function ScenarioCard({ code, icon: Icon, title, description, diff }: { code: string; icon: LucideIcon; title: string; description: string; diff: string }) {
  return (
    <div className="plate reg-corners group p-5 transition-colors hover:border-ink sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center border border-hairline text-ink">
          <Icon className="h-5 w-5" />
        </div>
        <span className="plate-id">{code}</span>
      </div>
      <h3 className="mb-2 text-lg font-bold text-ink">{title}</h3>
      <p className="mb-4 text-sm text-ink-soft">{description}</p>
      <span className="register">{diff}</span>
    </div>
  );
}
