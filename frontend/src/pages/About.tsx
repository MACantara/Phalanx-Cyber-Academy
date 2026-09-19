import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FadeIn, Stagger } from '../components/Animated';
import { ArrowRight, CheckCircle, Cpu, Layers, Trophy, ShieldCheck, Gamepad2, Zap, Shield, type LucideIcon } from 'lucide-react';

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
          <p className="mx-auto max-w-3xl text-base text-ink-soft opacity-0 animate-fade-in-up sm:text-lg" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>Empowering digital citizens through gamified cybersecurity education</p>
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
                <p>Phalanx Cyber Academy was born from a critical need: making cybersecurity education accessible, engaging, and effective for everyone. In an era where digital threats evolve daily, we believe that learning to protect yourself online shouldn't be boring or overwhelming.</p>
                <p>Through gamification, real-time feedback systems, and realistic simulations, we transform complex cybersecurity concepts into interactive adventures. Every scenario you complete, every challenge you overcome, and every achievement you unlock makes the digital world safer for everyone.</p>
                <p>Our platform addresses critical digital literacy gaps by combining the engagement of gaming with the rigor of professional cybersecurity training, creating an environment where learning is both fun and profoundly practical.</p>
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
                  <p className="register">Reimagined for the Digital Age</p>
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
            <p className="mx-auto max-w-3xl text-ink-soft sm:text-lg">Our educational approach combines proven learning methodologies with cutting-edge technology to create meaningful, lasting cybersecurity knowledge.</p>
          </FadeIn>
          <Stagger className="grid gap-6 md:grid-cols-3" baseDelay={0.1} increment={0.2}>
            <PhilosophyCard code="DOC-01" icon={Gamepad2} title="Gamification" text="Transform learning into adventure. Earn XP, unlock achievements, and progress through levels while mastering essential cybersecurity skills through interactive challenges and real-world scenarios." />
            <PhilosophyCard code="DOC-02" icon={Zap} title="Real-Time Feedback" text="Receive instant performance analysis and adaptive corrections as you learn. Our system identifies mistakes immediately and provides contextual tips to accelerate your cybersecurity mastery." />
            <PhilosophyCard code="DOC-03" icon={Shield} title="Real Scenarios" text="Practice with realistic cybersecurity simulations including phishing detection and network defense." />
          </Stagger>
        </div>
      </section>

      {/* Team — personnel register */}
      <section className="border-t border-hairline py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <FadeIn className="mb-12 text-center sm:mb-16">
            <span className="register">Plate 04 — Personnel</span>
            <h2 className="mb-4 mt-3 text-3xl tracking-tight text-ink sm:text-4xl lg:text-5xl">Meet Our Team</h2>
            <p className="mx-auto max-w-3xl text-ink-soft sm:text-lg">Dedicated professionals working together to make cybersecurity education accessible and engaging for everyone</p>
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
            <h2 className="mt-3 text-3xl tracking-tight text-ink sm:text-4xl lg:text-5xl">What Makes Phalanx Cyber Academy Different</h2>
          </FadeIn>
          <Stagger className="grid items-center gap-12 lg:grid-cols-2" baseDelay={0.1} increment={0.15}>
            <div className="space-y-8">
              <ShowcaseItem icon={Cpu} title="Adaptive Game Engine" text="Our AI game master adapts cybersecurity scenarios to your skill level, creating personalized gaming experiences that evolve with your expertise." />
              <ShowcaseItem icon={Layers} title="Immersive Cyber Adventures" text="Dive into realistic cybersecurity missions and interactive storylines that make learning feel like playing your favorite video game." />
              <ShowcaseItem icon={Trophy} title="Epic Achievement System" text="Unlock legendary badges and compete in cybersecurity tournaments while building real-world digital defense skills." />
            </div>
            <div className="plate plate-strong reg-corners p-6 sm:p-8">
              <span className="plate-id absolute left-3 top-3">ENR-01</span>
              <h3 className="mb-6 mt-4 text-2xl font-bold tracking-tight text-ink">{user ? 'Continue' : 'Start'} Your Cybersecurity Adventure</h3>
              <div className="space-y-4 text-ink-soft">
                <ListItem>Epic phishing detection missions</ListItem>
                <ListItem>AI-powered quest customization</ListItem>
                <ListItem>Multiplayer cybersecurity battles</ListItem>
                <ListItem>Real-time skill progression tracking</ListItem>
              </div>
              <Link to={user ? '/levels' : '/signup'} className="mt-6 inline-flex min-h-[44px] items-center justify-center bg-ink px-8 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink hover:text-stock dark:hover:bg-seal dark:hover:text-seal-ink">
                {user ? 'Continue Adventure' : 'Begin Quest'}
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
