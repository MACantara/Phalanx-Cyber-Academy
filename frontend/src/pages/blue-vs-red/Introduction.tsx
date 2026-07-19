import { Link } from 'react-router-dom';
import { FadeIn } from '../../components/Animated';
import { Shield, Sword, PlayCircle, BookOpen, Zap, Clock, Cpu, ShieldCheck } from 'lucide-react';

export default function Introduction() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-4 py-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-pulse rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 animate-pulse rounded-full bg-red-500/10 blur-3xl" style={{ animationDelay: '1s' }} />
        <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-purple-500/10 blur-3xl" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <FadeIn>
          <div className="mb-6 flex justify-center gap-4">
            <Shield className="h-16 w-16 text-green-400" />
            <Sword className="h-16 w-16 text-red-400" />
          </div>
          <h1 className="text-5xl font-bold text-white md:text-6xl">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 bg-clip-text text-transparent">
              Blue Team vs Red Team
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-slate-300">
            Experience the ultimate cybersecurity simulation where you defend against intelligent AI adversaries
          </p>

          <div className="mt-12 rounded-2xl border border-slate-600/50 bg-slate-800/60 p-8">
            <h2 className="mb-6 text-3xl font-bold text-white">
              <PlayCircle className="mb-2 mr-3 inline h-8 w-8 text-blue-400" />
              Ready to Begin?
            </h2>
            <p className="mb-8 text-xl text-slate-300">
              Enter the cybersecurity battlefield and defend Project Sentinel Academy against adaptive AI attacks
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/blue-vs-red/dashboard"
                className="inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-12 py-4 text-xl font-bold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700"
              >
                <PlayCircle className="mr-3 h-6 w-6" /> Start Simulation
              </Link>
              <Link
                to="/blue-vs-red/tutorial"
                className="inline-flex items-center rounded-xl bg-slate-700 px-8 py-3 text-lg font-semibold text-white transition-all hover:bg-slate-600"
              >
                <BookOpen className="mr-2 h-5 w-5" /> Tutorial
              </Link>
            </div>
            <p className="mt-6 text-slate-400">Your mission begins now. Good luck, defender!</p>
          </div>

          <div className="mt-16 text-center">
            <h2 className="mb-8 text-3xl font-bold text-white">
              <Zap className="mb-2 mr-3 inline h-8 w-8 text-yellow-400" />
              High-Intensity Cyber Defense
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-slate-600/30 bg-slate-800/50 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-blue-500/50">
                <Clock className="mx-auto mb-4 h-10 w-10 text-orange-400" />
                <h3 className="mb-2 text-xl font-semibold text-white">15-Minute Rounds</h3>
                <p className="text-slate-300">Fast-paced simulations with time pressure</p>
              </div>
              <div className="rounded-xl border border-slate-600/30 bg-slate-800/50 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-purple-500/50">
                <Cpu className="mx-auto mb-4 h-10 w-10 text-purple-400" />
                <h3 className="mb-2 text-xl font-semibold text-white">Adaptive AI</h3>
                <p className="text-slate-300">Smart adversary that learns from your moves</p>
              </div>
              <div className="rounded-xl border border-slate-600/30 bg-slate-800/50 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-green-500/50">
                <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-green-400" />
                <h3 className="mb-2 text-xl font-semibold text-white">Real Defense</h3>
                <p className="text-slate-300">MITRE ATT&CK based attack scenarios</p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
