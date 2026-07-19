import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FadeIn, Stagger } from '../components/Animated';
import { ArrowRight, CheckCircle, Cpu, Layers, Trophy, ShieldCheck, Gamepad2, Zap, Shield, type LucideIcon } from 'lucide-react';

const team = [
  { name: 'Jean Alexis L. Santos', role: 'Project Manager', image: '/team/santos.png', color: 'from-green-500 to-emerald-600' },
  { name: 'Michael Angelo R. Cantara', role: 'Lead Developer', image: '/team/cantara.png', color: 'from-blue-500 to-cyan-600' },
  { name: 'Hanneh Mae P. Baptista', role: 'Research Specialist and Documentation Lead', image: '/team/baptista.png', color: 'from-purple-500 to-pink-600' },
  { name: 'Chrissanta Joy Erica C. Puyat', role: 'Quality Assurance and Testing Lead', image: '/team/puyat.png', color: 'from-orange-500 to-red-600' },
];

export default function About() {
  const { user } = useAuth();

  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 py-20 transition-colors duration-300 dark:from-blue-950 dark:via-purple-950 dark:to-indigo-950">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-8 opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards' }}>
            <img src="/logo-bg.png" alt="Phalanx Cyber Academy Logo" className="mx-auto h-24 w-auto drop-shadow-2xl md:h-32" />
          </div>
          <h1 className="mb-6 text-5xl font-bold text-white md:text-6xl opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>About Phalanx Cyber Academy</h1>
          <p className="mx-auto mb-3 max-w-3xl text-2xl font-semibold text-white opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>Train. Coordinate. Defend.</p>
          <p className="mx-auto max-w-3xl text-xl text-gray-200 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>Empowering digital citizens through gamified cybersecurity education</p>
        </div>
        <div className="absolute right-20 top-20 h-40 w-40 animate-bounce rounded-full bg-green-400/10 cyber-glow" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-20 left-20 h-32 w-32 animate-bounce rounded-full bg-blue-400/10" style={{ animationDelay: '2s', animationDuration: '5s' }} />
      </section>

      {/* Mission */}
      <section className="bg-gradient-to-br from-white to-gray-50 py-20 transition-colors duration-300 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <FadeIn direction="left">
              <h2 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">Our Mission</h2>
              <div className="space-y-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                <p>Phalanx Cyber Academy was born from a critical need: making cybersecurity education accessible, engaging, and effective for everyone. In an era where digital threats evolve daily, we believe that learning to protect yourself online shouldn't be boring or overwhelming.</p>
                <p>Through gamification, real-time feedback systems, and realistic simulations, we transform complex cybersecurity concepts into interactive adventures. Every scenario you complete, every challenge you overcome, and every achievement you unlock makes the digital world safer for everyone.</p>
                <p>Our platform addresses critical digital literacy gaps by combining the engagement of gaming with the rigor of professional cybersecurity training, creating an environment where learning is both fun and profoundly practical.</p>
              </div>
              <Link to="/contact" className="cyber-glow mt-8 inline-flex transform items-center rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:from-green-700 hover:to-emerald-700">
                Get Involved <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </FadeIn>
            <FadeIn delay="0.3s">
              <div className="group relative">
                <div className="flex h-96 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 p-8 text-center text-white shadow-2xl transition-transform duration-500 group-hover:scale-105">
                  <div>
                    <ShieldCheck className="mx-auto mb-4 h-24 w-24 opacity-80" />
                    <h3 className="mb-2 text-2xl font-bold">Cybersecurity Education</h3>
                    <p className="text-lg opacity-90">Reimagined for the Digital Age</p>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-400/20 to-blue-400/20 transition-opacity duration-500 group-hover:opacity-0" />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Learning Philosophy */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20 transition-colors duration-300 dark:from-gray-800 dark:to-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">Learning Through Experience</h2>
            <p className="mx-auto max-w-4xl text-xl leading-relaxed text-gray-600 dark:text-gray-300">Our educational approach combines proven learning methodologies with cutting-edge technology to create meaningful, lasting cybersecurity knowledge.</p>
          </FadeIn>
          <Stagger className="grid gap-8 md:grid-cols-3" baseDelay={0.1} increment={0.2}>
            <PhilosophyCard icon={Gamepad2} title="Gamification" text="Transform learning into adventure. Earn XP, unlock achievements, and progress through levels while mastering essential cybersecurity skills through interactive challenges and real-world scenarios." color="green" />
            <PhilosophyCard icon={Zap} title="Real-Time Feedback" text="Receive instant performance analysis and adaptive corrections as you learn. Our system identifies mistakes immediately and provides contextual tips to accelerate your cybersecurity mastery." color="blue" />
            <PhilosophyCard icon={Shield} title="Real Scenarios" text="Practice with realistic cybersecurity simulations including phishing detection and network defense." color="purple" />
          </Stagger>
        </div>
      </section>

      {/* Team */}
      <section className="bg-gradient-to-br from-white to-gray-50 py-20 transition-colors duration-300 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">Meet Our Team</h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300">Dedicated professionals working together to make cybersecurity education accessible and engaging for everyone</p>
          </FadeIn>
          <Stagger className="grid gap-8 md:grid-cols-2 lg:grid-cols-4" baseDelay={0.1} increment={0.15}>
            {team.map((member) => (
              <div key={member.name} className="group h-full rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-lg transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                <div className={`mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br ${member.color} p-1 shadow-lg transition-all duration-300 group-hover:rotate-6 group-hover:scale-110`}>
                  <img src={member.image} alt={member.name} className="h-20 w-20 rounded-xl object-cover" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">{member.name}</h3>
                <p className="font-medium text-gray-600 dark:text-gray-300">{member.role}</p>
              </div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20 transition-colors duration-300 dark:from-gray-800 dark:to-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="mb-16 text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">What Makes Phalanx Cyber Academy Different</h2>
          </FadeIn>
          <Stagger className="grid items-center gap-12 lg:grid-cols-2" baseDelay={0.1} increment={0.15}>
            <div className="space-y-8">
              <ShowcaseItem icon={Cpu} title="Adaptive Game Engine" text="Our AI game master adapts cybersecurity scenarios to your skill level, creating personalized gaming experiences that evolve with your expertise." color="green" />
              <ShowcaseItem icon={Layers} title="Immersive Cyber Adventures" text="Dive into realistic cybersecurity missions and interactive storylines that make learning feel like playing your favorite video game." color="blue" />
              <ShowcaseItem icon={Trophy} title="Epic Achievement System" text="Unlock legendary badges and compete in cybersecurity tournaments while building real-world digital defense skills." color="purple" />
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
              <h3 className="mb-6 text-2xl font-bold">{user ? 'Continue' : 'Start'} Your Cybersecurity Adventure</h3>
              <div className="space-y-4">
                <ListItem>Epic phishing detection missions</ListItem>
                <ListItem>AI-powered quest customization</ListItem>
                <ListItem>Multiplayer cybersecurity battles</ListItem>
                <ListItem>Real-time skill progression tracking</ListItem>
              </div>
              <Link to={user ? '/levels' : '/signup'} className="mt-6 inline-flex items-center rounded-lg bg-white px-6 py-3 font-semibold text-indigo-600 transition-all duration-300 hover:bg-gray-100">
                {user ? 'Continue Adventure' : 'Begin Quest'}
              </Link>
            </div>
          </Stagger>
        </div>
      </section>
    </>
  );
}



function PhilosophyCard({ icon: Icon, title, text, color }: { icon: LucideIcon; title: string; text: string; color: 'green' | 'blue' | 'purple' }) {
  const gradients = { green: 'from-green-500 to-emerald-600', blue: 'from-blue-500 to-cyan-600', purple: 'from-purple-500 to-pink-600' };
  const borders = { green: 'hover:border-green-200 dark:hover:border-green-600', blue: 'hover:border-blue-200 dark:hover:border-blue-600', purple: 'hover:border-purple-200 dark:hover:border-purple-600' };
  return (
    <div className={`group rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-lg transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800 ${borders[color]}`}>
      <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${gradients[color]} text-3xl text-white shadow-lg transition-all duration-300 group-hover:rotate-6 group-hover:scale-110`}>
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">{title}</h3>
      <p className="leading-relaxed text-gray-600 dark:text-gray-300">{text}</p>
    </div>
  );
}

function ShowcaseItem({ icon: Icon, title, text, color }: { icon: LucideIcon; title: string; text: string; color: 'green' | 'blue' | 'purple' }) {
  const gradients = { green: 'from-green-500 to-emerald-600', blue: 'from-blue-500 to-cyan-600', purple: 'from-purple-500 to-pink-600' };
  return (
    <div className="flex items-start space-x-4">
      <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradients[color]} text-white`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{text}</p>
      </div>
    </div>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center space-x-3">
      <CheckCircle className="h-6 w-6 flex-shrink-0 text-green-300" />
      <span>{children}</span>
    </div>
  );
}
