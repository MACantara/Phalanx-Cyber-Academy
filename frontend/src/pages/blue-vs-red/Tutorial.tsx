import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowLeftRight,
  ArrowUp,
  Award,
  Building,
  CheckCircle,
  Clock,
  CloudUpload,
  Cpu,
  Crosshair,
  Database,
  EyeOff,
  Key,
  Lightbulb,
  LogIn,
  MessageSquare,
  PlayCircle,
  RefreshCw,
  Rocket,
  Scan,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
  Zap,
} from 'lucide-react';
import { FadeIn } from '../../components/Animated';

const blueTools = [
  { icon: ShieldCheck, label: 'Firewall' },
  { icon: Server, label: 'Endpoint Protection' },
  { icon: Key, label: 'Access Control' },
  { icon: Terminal, label: 'Defense Console' },
  { icon: Shield, label: 'IP Blocking' },
  { icon: Database, label: 'Asset Isolation' },
  { icon: CheckCircle, label: 'Patch Management' },
  { icon: RefreshCw, label: 'Credential Resets' },
];

const redTactics = [
  { icon: Search, label: 'Reconnaissance' },
  { icon: LogIn, label: 'Initial Access' },
  { icon: RefreshCw, label: 'Persistence' },
  { icon: ArrowUp, label: 'Privilege Escalation' },
  { icon: EyeOff, label: 'Defense Evasion' },
  { icon: Key, label: 'Credential Access' },
  { icon: Scan, label: 'Discovery' },
  { icon: ArrowLeftRight, label: 'Lateral Movement' },
  { icon: Database, label: 'Data Collection' },
  { icon: CloudUpload, label: 'Exfiltration' },
  { icon: Zap, label: 'Impact' },
];

const features = [
  { icon: Clock, title: 'Real-Time Action', text: '15-minute high-intensity sessions with live AI attacks every 3-5 seconds', hover: 'hover:border-blue-500/50' },
  { icon: MessageSquare, title: 'NLP-Enhanced AI', text: 'AI uses natural language processing to understand your defenses and adapt attacks', hover: 'hover:border-purple-500/50' },
  { icon: Terminal, title: 'Defense Terminal', text: 'Execute response actions: block IPs, isolate assets, patch vulnerabilities', hover: 'hover:border-green-500/50' },
  { icon: NetworkIcon, title: 'Network Defense Map', text: 'Monitor 4 critical assets with real-time integrity tracking and status updates', hover: 'hover:border-blue-500/50' },
  { icon: ShieldAlert, title: 'MITRE ATT&CK', text: 'Face 33 real attack techniques across 11 tactics from reconnaissance to impact', hover: 'hover:border-orange-500/50' },
  { icon: Cpu, title: 'Q-Learning AI', text: 'AI learns from your responses and improves its attack strategy in real-time', hover: 'hover:border-red-500/50' },
  { icon: AlertTriangle, title: 'Alert Center', text: 'Real-time threat alerts with severity levels and recommended response actions', hover: 'hover:border-yellow-500/50' },
  { icon: Award, title: 'XP Rewards', text: 'Earn XP for successful defenses, with bonuses for speed and accuracy', hover: 'hover:border-purple-500/50' },
];

const proTips = [
  {
    title: 'Watch Asset Integrity',
    text: 'Monitor the 4 assets (Academy Server, Student DB, Research Files, Learning Platform) - they lose integrity when attacked',
  },
  {
    title: 'Block Malicious IPs',
    text: 'The AI will change IPs if blocked - watch for patterns and block quickly',
  },
  {
    title: 'Use Response Actions',
    text: 'Terminal offers 5 actions: Block IP, Isolate Asset, Increase Monitoring, Patch Vulnerability, Reset Credentials',
  },
  {
    title: 'Manage Security Controls',
    text: 'Toggle Firewall, Endpoint Protection, and Access Control - each affects AI success rates',
  },
  {
    title: 'Understand MITRE Phases',
    text: 'AI progresses: Reconnaissance → Initial Access → Persistence → Escalation → Exfiltration → Impact',
  },
  {
    title: 'AI Learns From You',
    text: 'The AI uses Q-learning and NLP - it will adapt its attack strategy based on your defensive patterns',
  },
  {
    title: 'Earn More XP',
    text: 'XP awarded at session end: +10-20 per successful defense, bonuses for time remaining and high asset integrity',
  },
  {
    title: 'Open Browser Console',
    text: 'Press F12 to see AI decisions, NLP analysis, Q-learning updates, and MITRE technique IDs in real-time',
  },
];

function NetworkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="3" />
      <circle cx="5" cy="19" r="3" />
      <circle cx="19" cy="19" r="3" />
      <path d="M8 8.5a6 6 0 0 0 8 0" />
      <path d="M12 8v3" />
      <path d="M9.5 15l-3 3" />
      <path d="M14.5 15l3 3" />
    </svg>
  );
}

export default function Tutorial() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-pulse rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 animate-pulse rounded-full bg-red-500/10 blur-3xl" style={{ animationDelay: '1s' }} />
        <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-purple-500/10 blur-3xl" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10">
        <section className="pt-20">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <FadeIn>
              <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl">
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 bg-clip-text text-transparent">
                  Blue vs Red Team Tutorial
                </span>
              </h1>
              <p className="mb-8 text-xl text-slate-300">
                Learn the fundamentals before entering the cybersecurity battlefield
              </p>
              <Link
                to="/blue-vs-red"
                className="inline-flex items-center rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:from-slate-700 hover:to-slate-800"
              >
                <ArrowLeft className="mr-2 h-5 w-5" /> Back to Intro
              </Link>
            </FadeIn>
          </div>
        </section>

        <section className="pt-16">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-white">
              <Users className="mb-2 mr-3 inline h-8 w-8 text-blue-400" />
              Understanding the Teams
            </h2>

            <div className="grid gap-8 md:grid-cols-2">
              <FadeIn className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-8 backdrop-blur-sm transition-colors hover:border-blue-400/50">
                <div className="mb-6 text-center">
                  <ShieldCheck className="mx-auto mb-4 h-16 w-16 text-blue-400" />
                  <h3 className="text-3xl font-bold text-blue-400">Blue Team</h3>
                  <p className="text-blue-200">You - The Defender</p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg bg-blue-800/30 p-4">
                    <h4 className="mb-2 text-xl font-semibold text-blue-300">Your Mission</h4>
                    <ul className="space-y-2 text-blue-100">
                      <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-400" /> Monitor 4 critical assets</li>
                      <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-400" /> Detect AI attack patterns</li>
                      <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-400" /> Block malicious IPs</li>
                      <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-400" /> Maintain asset integrity</li>
                    </ul>
                  </div>

                  <div className="rounded-lg bg-blue-800/30 p-4">
                    <h4 className="mb-2 text-xl font-semibold text-blue-300">Defense Tools</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-blue-100">
                      {blueTools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <div key={tool.label} className="flex items-center"><Icon className="mr-2 h-4 w-4 text-blue-400" /> {tool.label}</div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay="0.1s" className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-900/40 to-red-800/20 p-8 backdrop-blur-sm transition-colors hover:border-red-400/50">
                <div className="mb-6 text-center">
                  <Cpu className="mx-auto mb-4 h-16 w-16 text-red-400" />
                  <h3 className="text-3xl font-bold text-red-400">Red Team AI</h3>
                  <p className="text-red-200">NLP-Enhanced Adversary</p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg bg-red-800/30 p-4">
                    <h4 className="mb-2 text-xl font-semibold text-red-300">AI Capabilities</h4>
                    <ul className="space-y-2 text-red-100">
                      <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-red-400" /> NLP Context Analysis</li>
                      <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-red-400" /> Q-Learning Reinforcement</li>
                      <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-red-400" /> Adaptive Attack Selection</li>
                      <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-red-400" /> MITRE ATT&CK Framework</li>
                    </ul>
                  </div>

                  <div className="rounded-lg bg-red-800/30 p-4">
                    <h4 className="mb-2 text-xl font-semibold text-red-300">33 Attack Techniques</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-red-100">
                      {redTactics.map((tactic) => {
                        const Icon = tactic.icon;
                        return (
                          <div key={tactic.label} className="flex items-center"><Icon className="mr-2 h-4 w-4 text-red-400" /> {tactic.label}</div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        <section className="pt-16">
          <div className="mx-auto max-w-6xl px-4">
            <FadeIn>
              <div className="rounded-2xl border border-slate-600/50 bg-slate-800/40 p-8 backdrop-blur-lg">
                <h2 className="mb-8 text-center text-3xl font-bold text-white">
                  <Building className="mb-2 mr-3 inline h-8 w-8 text-blue-400" />
                  Project Sentinel Academy Scenario
                </h2>

                <p className="mb-12 text-center text-xl text-slate-300">
                  You are the cybersecurity specialist for Project Sentinel Academy, a cutting-edge educational institution that houses sensitive research data, student records, and proprietary learning systems.
                </p>

                <div className="grid gap-8 md:grid-cols-3">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/20">
                      <ShieldCheck className="h-8 w-8 text-blue-400" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-white">Your Role</h3>
                    <p className="text-slate-300">Lead the blue team defense operations and protect critical infrastructure from advanced AI-powered cyber attacks.</p>
                  </div>

                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-600/20">
                      <Server className="h-8 w-8 text-green-400" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-white">Critical Assets</h3>
                    <p className="text-slate-300">Student databases, research repositories, learning management systems, and network infrastructure you must defend.</p>
                  </div>

                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-600/20">
                      <Crosshair className="h-8 w-8 text-red-400" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-white">Threat Landscape</h3>
                    <p className="text-slate-300">Advanced persistent threats targeting educational institutions for intellectual property and sensitive data.</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <section className="pt-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-white">
              <Sparkles className="mb-2 mr-3 inline h-8 w-8 text-yellow-400" />
              Simulation Features
            </h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <FadeIn
                    key={feature.title}
                    className={`rounded-xl border border-slate-600/30 bg-slate-800/50 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 ${feature.hover}`}
                  >
                    <Icon className="mb-4 h-8 w-8 text-blue-400" />
                    <h3 className="mb-2 text-xl font-semibold text-white">{feature.title}</h3>
                    <p className="text-slate-300">{feature.text}</p>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>

        <section className="pt-16">
          <div className="mx-auto max-w-6xl px-4">
            <FadeIn>
              <div className="rounded-2xl border border-blue-500/30 bg-blue-900/30 p-8 backdrop-blur-lg">
                <h2 className="mb-6 text-2xl font-bold text-blue-400">
                  <Lightbulb className="mr-3 inline h-6 w-6 text-yellow-400" />
                  Pro Tips for Success
                </h2>

                <div className="grid gap-6 md:grid-cols-2">
                  {proTips.map((tip) => (
                    <div
                      key={tip.title}
                      className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-blue-800/20"
                    >
                      <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-400" />
                      <div>
                        <h4 className="font-semibold text-blue-200">{tip.title}</h4>
                        <p className="text-sm text-blue-100">{tip.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <FadeIn>
              <div className="rounded-2xl border border-slate-600/50 bg-slate-800/60 p-8">
                <h2 className="mb-6 text-3xl font-bold text-white">
                  <Rocket className="mb-2 mr-3 inline h-8 w-8 text-blue-400" />
                  Ready to Defend the Academy?
                </h2>

                <p className="mb-8 text-xl text-slate-300">
                  You've learned the basics. Now put your skills to the test in the real simulation!
                </p>

                <Link
                  to="/blue-vs-red/dashboard"
                  className="inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-12 py-4 text-xl font-bold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700"
                >
                  <PlayCircle className="mr-3 h-6 w-6" /> Start Simulation Now
                </Link>

                <p className="mt-6 text-slate-400">Your mission awaits. Project Sentinel Academy is counting on you!</p>
              </div>
            </FadeIn>
          </div>
        </section>
      </div>
    </section>
  );
}
