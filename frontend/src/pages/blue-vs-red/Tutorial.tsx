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
  { icon: Clock, title: 'Real-Time Action', text: '15-minute high-intensity sessions with live AI attacks every 3-5 seconds' },
  { icon: MessageSquare, title: 'NLP-Enhanced AI', text: 'AI uses natural language processing to understand your defenses and adapt attacks' },
  { icon: Terminal, title: 'Defense Terminal', text: 'Execute response actions: block IPs, isolate assets, patch vulnerabilities' },
  { icon: NetworkIcon, title: 'Network Defense Map', text: 'Monitor 4 critical assets with real-time integrity tracking and status updates' },
  { icon: ShieldAlert, title: 'MITRE ATT&CK', text: 'Face 33 real attack techniques across 11 tactics from reconnaissance to impact' },
  { icon: Cpu, title: 'Q-Learning AI', text: 'AI learns from your responses and improves its attack strategy in real-time' },
  { icon: AlertTriangle, title: 'Alert Center', text: 'Real-time threat alerts with severity levels and recommended response actions' },
  { icon: Award, title: 'XP Rewards', text: 'Earn XP for successful defenses, with bonuses for speed and accuracy' },
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
    <section className="relative min-h-screen overflow-hidden bg-stock">
      <div className="dotfield absolute inset-0" aria-hidden="true" />

      <div className="relative z-10">
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 text-center sm:px-8">
            <FadeIn>
              <span className="register">Plate 01 — Field Manual</span>
              <h1 className="mb-6 mt-3 text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
                <span className="text-seal-ink">Blue</span> vs <span className="text-strike">Red</span> Team Tutorial
              </h1>
              <p className="mb-8 text-lg text-ink-soft sm:text-xl">
                Learn the fundamentals before entering the cybersecurity battlefield
              </p>
              <Link
                to="/blue-vs-red"
                className="inline-flex min-h-[44px] items-center justify-center border border-ink px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-stock-green"
              >
                <ArrowLeft className="mr-2 h-5 w-5" /> Back to Intro
              </Link>
            </FadeIn>
          </div>
        </section>

        <section className="border-t border-hairline py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mb-12 text-center">
              <span className="register">Plate 02 — Order of Battle</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                <Users className="mb-2 mr-3 inline h-8 w-8 text-ink" />
                Understanding the Teams
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <FadeIn className="plate border-l-4 border-l-seal-ink p-5 transition-colors hover:border-ink sm:p-8">
                <div className="mb-6 text-center">
                  <ShieldCheck className="mx-auto mb-4 h-16 w-16 text-seal-ink" />
                  <h3 className="text-3xl font-bold tracking-tight text-seal-ink">Blue Team</h3>
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">You - The Defender</p>
                </div>

                <div className="space-y-4">
                  <div className="border border-hairline bg-stock-drift p-4">
                    <h4 className="mb-2 text-xl font-semibold text-ink">Your Mission</h4>
                    <ul className="space-y-2 text-ink-soft">
                      <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-confirm" /> Monitor 4 critical assets</li>
                      <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-confirm" /> Detect AI attack patterns</li>
                      <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-confirm" /> Block malicious IPs</li>
                      <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-confirm" /> Maintain asset integrity</li>
                    </ul>
                  </div>

                  <div className="border border-hairline bg-stock-drift p-4">
                    <h4 className="mb-2 text-xl font-semibold text-ink">Defense Tools</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-ink-soft">
                      {blueTools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <div key={tool.label} className="flex items-center"><Icon className="mr-2 h-4 w-4 text-seal-ink" /> {tool.label}</div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay="0.1s" className="plate border-l-4 border-l-strike p-5 transition-colors hover:border-ink sm:p-8">
                <div className="mb-6 text-center">
                  <Cpu className="mx-auto mb-4 h-16 w-16 text-strike" />
                  <h3 className="text-3xl font-bold tracking-tight text-strike">Red Team AI</h3>
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">NLP-Enhanced Adversary</p>
                </div>

                <div className="space-y-4">
                  <div className="border border-hairline bg-stock-drift p-4">
                    <h4 className="mb-2 text-xl font-semibold text-ink">AI Capabilities</h4>
                    <ul className="space-y-2 text-ink-soft">
                      <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-strike" /> NLP Context Analysis</li>
                      <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-strike" /> Q-Learning Reinforcement</li>
                      <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-strike" /> Adaptive Attack Selection</li>
                      <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-strike" /> MITRE ATT&CK Framework</li>
                    </ul>
                  </div>

                  <div className="border border-hairline bg-stock-drift p-4">
                    <h4 className="mb-2 text-xl font-semibold text-ink">33 Attack Techniques</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-ink-soft">
                      {redTactics.map((tactic) => {
                        const Icon = tactic.icon;
                        return (
                          <div key={tactic.label} className="flex items-center"><Icon className="mr-2 h-4 w-4 text-strike" /> {tactic.label}</div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        <section className="border-t border-hairline py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <FadeIn>
              <div className="plate reg-corners p-5 sm:p-8">
                <span className="plate-id absolute left-3 top-3">EXH-01</span>
                <div className="mb-8 mt-4 text-center">
                  <span className="register">Plate 03 — Scenario Brief</span>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                    <Building className="mb-2 mr-3 inline h-8 w-8 text-ink" />
                    Project Sentinel Academy Scenario
                  </h2>
                </div>

                <p className="mb-12 text-center text-lg text-ink-soft sm:text-xl">
                  You are the cybersecurity specialist for Project Sentinel Academy, a cutting-edge educational institution that houses sensitive research data, student records, and proprietary learning systems.
                </p>

                <div className="grid gap-8 md:grid-cols-3">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border border-hairline bg-stock-drift text-seal-ink">
                      <ShieldCheck className="h-8 w-8" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-ink">Your Role</h3>
                    <p className="text-ink-soft">Lead the blue team defense operations and protect critical infrastructure from advanced AI-powered cyber attacks.</p>
                  </div>

                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border border-hairline bg-stock-drift text-confirm">
                      <Server className="h-8 w-8" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-ink">Critical Assets</h3>
                    <p className="text-ink-soft">Student databases, research repositories, learning management systems, and network infrastructure you must defend.</p>
                  </div>

                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border border-hairline bg-stock-drift text-strike">
                      <Crosshair className="h-8 w-8" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-ink">Threat Landscape</h3>
                    <p className="text-ink-soft">Advanced persistent threats targeting educational institutions for intellectual property and sensitive data.</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <section className="border-t border-hairline py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mb-12 text-center">
              <span className="register">Plate 04 — Capability Register</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                <Sparkles className="mb-2 mr-3 inline h-8 w-8 text-ink" />
                Simulation Features
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <FadeIn
                    key={feature.title}
                    className="plate p-5 transition-colors hover:border-ink sm:p-6"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center border border-hairline text-ink">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-ink">{feature.title}</h3>
                    <p className="text-ink-soft">{feature.text}</p>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-hairline py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <FadeIn>
              <div className="plate border-l-4 border-l-seal-ink p-5 sm:p-8">
                <span className="register">Plate 05 — Defender's Notes</span>
                <h2 className="mb-6 mt-3 text-2xl font-bold tracking-tight text-seal-ink">
                  <Lightbulb className="mr-3 inline h-6 w-6 text-seal-ink" />
                  Pro Tips for Success
                </h2>

                <div className="grid gap-6 md:grid-cols-2">
                  {proTips.map((tip) => (
                    <div
                      key={tip.title}
                      className="flex items-start gap-3 border border-hairline bg-stock-drift p-3 transition-colors hover:bg-stock-green"
                    >
                      <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-confirm" />
                      <div>
                        <h4 className="font-semibold text-ink">{tip.title}</h4>
                        <p className="text-sm text-ink-soft">{tip.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <section className="border-t border-hairline py-14 sm:py-20">
          <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
            <FadeIn>
              <div className="bg-ink p-5 text-stock sm:p-8">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-stock/70">Final Plate — Deployment</span>
                <h2 className="mb-6 mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  <Rocket className="mb-2 mr-3 inline h-8 w-8" />
                  Ready to Defend the Academy?
                </h2>

                <p className="mb-8 text-lg text-stock/80 sm:text-xl">
                  You've learned the basics. Now put your skills to the test in the real simulation!
                </p>

                <Link
                  to="/blue-vs-red/dashboard"
                  className="inline-flex min-h-[44px] items-center justify-center bg-stock px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-seal"
                >
                  <PlayCircle className="mr-3 h-5 w-5" /> Start Simulation Now
                </Link>

                <p className="mt-6 font-mono text-xs uppercase tracking-[0.14em] text-stock/70">Your mission awaits. Project Sentinel Academy is counting on you!</p>
              </div>
            </FadeIn>
          </div>
        </section>
      </div>
    </section>
  );
}
