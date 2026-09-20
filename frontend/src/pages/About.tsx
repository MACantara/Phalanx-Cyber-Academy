import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FadeIn, Stagger } from '../components/Animated';
import { ArrowRight, CheckCircle, Monitor, Layers, Trophy, ShieldCheck, Gamepad2, Zap, Shield, type LucideIcon } from 'lucide-react';

const team = [
  { name: 'Jean Alexis L. Santos', role: 'Project Manager', image: '/team/santos.png' },
  { name: 'Michael Angelo R. Cantara', role: 'Lead Developer', image: '/team/cantara.png' },
  { name: 'Hanneh Mae P. Baptista', role: 'Research Specialist and Documentation Lead', image: '/team/baptista.png' },
  { name: 'Chrissanta Joy Erica C. Puyat', role: 'Quality Assurance and Testing Lead', image: '/team/puyat.png' },
];

export default function About() {
  const { user } = useAuth();

  return (
    <>
      {/* Header — registered mark on stock */}
      <section className="relative flex items-center overflow-hidden bg-stock py-16 transition-colors duration-300 sm:py-20">
        <div className="dotfield absolute inset-0" aria-hidden="true" />
        <span className="absolute left-4 top-4 font-mono text-ink opacity-50 sm:left-6 sm:top-6" aria-hidden="true">+</span>
        <span className="absolute right-4 top-4 font-mono text-ink opacity-50 sm:right-6 sm:top-6" aria-hidden="true">+</span>
        <span className="absolute bottom-4 left-4 font-mono text-ink opacity-50 sm:bottom-6 sm:left-6" aria-hidden="true">+</span>
        <span className="absolute bottom-4 right-4 font-mono text-ink opacity-50 sm:bottom-6 sm:right-6" aria-hidden="true">+</span>

        <div className="relative z-10 mx-auto max-w-6xl px-5 text-center sm:px-8">
          <div className="mb-8 opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards' }}>
            <img src="/logo-bg.png" alt="Phalanx Cyber Academy Logo" className="mx-auto h-24 w-auto sm:h-32" />
          </div>
          <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-ink opacity-0 animate-fade-in-up sm:text-6xl" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>About Phalanx Cyber Academy</h1>
          <p className="mx-auto mb-3 max-w-3xl text-xl font-semibold text-ink opacity-0 animate-fade-in-up sm:text-2xl" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>Train. Coordinate. Defend.</p>
          <p className="mx-auto max-w-3xl text-base text-ink-soft opacity-0 animate-fade-in-up sm:text-lg" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>A training academy where missions play inside a simulated workstation</p>
        </div>
      </section>

      {/* Mission */}
      <section className="border-t border-hairline py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <FadeIn direction="left">
              <span className="register">Plate 02 — Mission</span>
              <h2 className="mb-6 mt-3 text-3xl tracking-tight text-ink sm:text-4xl lg:text-5xl">Our Mission</h2>
              <div className="space-y-6 text-base leading-relaxed text-ink-soft sm:text-lg">
                <p>Phalanx Cyber Academy teaches digital defense the way the job works: by making calls under realistic conditions. Each level is a scenario inside a simulated PC. You read the inbox, check the source, contain the infection, and every decision is scored.</p>
                <p>Missions cover phishing, misinformation, malware response, ethical hacking, and digital forensics. Progress is tracked in XP, badges, streaks, and a session report per scenario.</p>
                <p>Nothing here is a video to watch and forget. Scenarios are hands-on exercises in a safe environment where a wrong call costs marks, not machines.</p>
              </div>
              <Link to="/contact" className="mt-8 inline-flex min-h-[44px] items-center justify-center bg-ink px-8 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink hover:text-stock dark:hover:bg-seal dark:hover:text-seal-ink">
                Get Involved <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </FadeIn>
            <FadeIn delay="0.3s">
              <div className="plate plate-strong reg-corners flex h-72 w-full items-center justify-center p-8 text-center sm:h-96">
                <span className="plate-id absolute left-3 top-3">EXH-01</span>
                <div>
                  <ShieldCheck className="mx-auto mb-4 h-20 w-20 text-seal-ink sm:h-24 sm:w-24" />
                  <h3 className="mb-2 text-2xl font-bold text-ink">Cybersecurity Education</h3>
                  <p className="register">Field training, on the record</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Learning Philosophy */}
      <section className="border-t border-hairline py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <FadeIn className="mb-12 text-center sm:mb-16">
            <span className="register">Plate 03 — Doctrine</span>
            <h2 className="mb-4 mt-3 text-3xl tracking-tight text-ink sm:text-4xl lg:text-5xl">Learning Through Experience</h2>
            <p className="mx-auto max-w-3xl text-ink-soft sm:text-lg">Every mission runs on the same loop: observe, decide, take the verdict.</p>
          </FadeIn>
          <Stagger className="grid gap-6 md:grid-cols-3" baseDelay={0.1} increment={0.2}>
            <PhilosophyCard code="DOC-01" icon={Gamepad2} title="Missions" text="Level-based scenarios inside a simulated workstation. Apps share the world: an email's link opens the browser, evidence unlocks the case." />
            <PhilosophyCard code="DOC-02" icon={Zap} title="Verdicts" text="Every call lands a verdict with the reasoning attached. Scoring follows your decisions, not a pass/fail gate." />
            <PhilosophyCard code="DOC-03" icon={Shield} title="The Record" text="XP, badges, streaks, and a session report per mission. The register keeps score across levels." />
          </Stagger>
        </div>
      </section>

      {/* Team — personnel register */}
      <section className="border-t border-hairline py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <FadeIn className="mb-12 text-center sm:mb-16">
            <span className="register">Plate 04 — Personnel</span>
            <h2 className="mb-4 mt-3 text-3xl tracking-tight text-ink sm:text-4xl lg:text-5xl">Meet Our Team</h2>
            <p className="mx-auto max-w-3xl text-ink-soft sm:text-lg">The team behind the academy</p>
          </FadeIn>
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" baseDelay={0.1} increment={0.15}>
            {team.map((member, i) => (
              <div key={member.name} className="plate reg-corners p-5 text-center transition-colors hover:border-ink sm:p-6">
                <span className="plate-id absolute left-3 top-3">{`TM-0${i + 1}`}</span>
                <img src={member.image} alt={member.name} className="mx-auto mb-4 mt-6 h-24 w-24 rounded-full border border-hairline object-cover" />
                <h3 className="mb-2 text-lg font-bold text-ink">{member.name}</h3>
                <p className="register">{member.role}</p>
              </div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="border-t border-hairline py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <FadeIn className="mb-12 text-center sm:mb-16">
            <span className="register">Plate 05 — Capability</span>
            <h2 className="mt-3 text-3xl tracking-tight text-ink sm:text-4xl lg:text-5xl">How the Academy Differs</h2>
          </FadeIn>
          <Stagger className="grid items-center gap-12 lg:grid-cols-2" baseDelay={0.1} increment={0.15}>
            <div className="space-y-8">
              <ShowcaseItem icon={Monitor} title="One Environment, Not Minigames" text="Apps share the world. An email's link opens the browser, a download lands in Files, and evidence unlocks the case." />
              <ShowcaseItem icon={Layers} title="Objectives Gate Completion" text="A mission ends when its objectives are done. The score follows the calls you made along the way." />
              <ShowcaseItem icon={Trophy} title="An Adaptive Adversary" text="In the Blue vs. Red exercise, an AI red team picks its attacks from your defensive moves." />
            </div>
            <div className="plate plate-strong reg-corners p-6 sm:p-8">
              <span className="plate-id absolute left-3 top-3">ENR-01</span>
              <h3 className="mb-6 mt-4 text-2xl font-bold tracking-tight text-ink">{user ? 'Resume' : 'Begin'} Training</h3>
              <div className="space-y-4 text-ink-soft">
                <ListItem>Phishing, misinformation, malware, hacking, and forensics scenarios</ListItem>
                <ListItem>Workstation and handset play</ListItem>
                <ListItem>Blue vs. Red defense exercise</ListItem>
                <ListItem>XP, badges, streaks, and leaderboard standing</ListItem>
              </div>
              <Link to={user ? '/levels' : '/signup'} className="mt-6 inline-flex min-h-[44px] items-center justify-center bg-ink px-8 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink hover:text-stock dark:hover:bg-seal dark:hover:text-seal-ink">
                {user ? 'Continue Training' : 'Enlist'}
              </Link>
            </div>
          </Stagger>
        </div>
      </section>
    </>
  );
}



function PhilosophyCard({ code, icon: Icon, title, text }: { code: string; icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="plate reg-corners p-6 text-center transition-colors hover:border-ink sm:p-8">
      <span className="plate-id absolute left-3 top-3">{code}</span>
      <div className="mx-auto mb-6 mt-4 flex h-16 w-16 items-center justify-center bg-seal text-seal-ink">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mb-3 text-xl font-bold text-ink">{title}</h3>
      <p className="leading-relaxed text-ink-soft">{text}</p>
    </div>
  );
}

function ShowcaseItem({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center border border-hairline text-ink">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="mb-2 text-xl font-bold text-ink">{title}</h3>
        <p className="text-ink-soft">{text}</p>
      </div>
    </div>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle className="h-5 w-5 flex-shrink-0 text-confirm" />
      <span>{children}</span>
    </div>
  );
}
