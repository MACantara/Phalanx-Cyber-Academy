import { Link } from 'react-router-dom';
import { FadeIn } from '../../components/Animated';
import { Shield, Sword, PlayCircle, BookOpen, Zap, Clock, Cpu, ShieldCheck } from 'lucide-react';

export default function Introduction() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stock px-5 py-14 sm:py-20">
      <div className="dotfield absolute inset-0" aria-hidden="true" />
      <span className="absolute left-4 top-4 font-mono text-ink opacity-50 sm:left-6 sm:top-6" aria-hidden="true">+</span>
      <span className="absolute right-4 top-4 font-mono text-ink opacity-50 sm:right-6 sm:top-6" aria-hidden="true">+</span>
      <span className="absolute bottom-4 left-4 font-mono text-ink opacity-50 sm:bottom-6 sm:left-6" aria-hidden="true">+</span>
      <span className="absolute bottom-4 right-4 font-mono text-ink opacity-50 sm:bottom-6 sm:right-6" aria-hidden="true">+</span>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <FadeIn>
          <div className="mb-6 flex justify-center gap-4">
            <Shield className="h-16 w-16 text-seal-ink" />
            <Sword className="h-16 w-16 text-strike" />
          </div>
          <span className="register">Plate 01 — War Game Register</span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl md:text-6xl">
            <span className="text-seal-ink">Blue Team</span> vs <span className="text-strike">Red Team</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-soft sm:text-xl">
            Experience the ultimate cybersecurity simulation where you defend against intelligent AI adversaries
          </p>

          <div className="plate reg-corners mt-12 p-5 sm:p-8">
            <span className="plate-id absolute left-3 top-3">BVR-00</span>
            <span className="register">Exercise — Enlistment</span>
            <h2 className="mb-6 mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              <PlayCircle className="mb-2 mr-3 inline h-8 w-8 text-seal-ink" />
              Ready to Begin?
            </h2>
            <p className="mb-8 text-lg text-ink-soft sm:text-xl">
              Enter the cybersecurity battlefield and defend Project Sentinel Academy against adaptive AI attacks
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/blue-vs-red/dashboard"
                className="inline-flex min-h-[44px] items-center justify-center bg-ink px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink hover:text-stock"
              >
                <PlayCircle className="mr-3 h-5 w-5" /> Start Simulation
              </Link>
              <Link
                to="/blue-vs-red/tutorial"
                className="inline-flex min-h-[44px] items-center justify-center border border-ink px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-stock-green"
              >
                <BookOpen className="mr-2 h-5 w-5" /> Tutorial
              </Link>
            </div>
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">Your mission begins now. Good luck, defender!</p>
          </div>

          <div className="mt-16 text-center">
            <span className="register">Plate 02 — Threat Assessment</span>
            <h2 className="mb-8 mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              <Zap className="mb-2 mr-3 inline h-8 w-8 text-strike" />
              High-Intensity Cyber Defense
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="plate reg-corners p-5 transition-colors hover:border-ink sm:p-6">
                <span className="plate-id absolute left-3 top-3">BVR-01</span>
                <div className="mx-auto mb-6 mt-4 flex h-16 w-16 items-center justify-center bg-seal text-seal-ink">
                  <Clock className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-ink">15-Minute Rounds</h3>
                <p className="text-ink-soft">Fast-paced simulations with time pressure</p>
              </div>
              <div className="plate reg-corners p-5 transition-colors hover:border-ink sm:p-6">
                <span className="plate-id absolute left-3 top-3">BVR-02</span>
                <div className="mx-auto mb-6 mt-4 flex h-16 w-16 items-center justify-center bg-seal text-seal-ink">
                  <Cpu className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-ink">Adaptive AI</h3>
                <p className="text-ink-soft">Smart adversary that learns from your moves</p>
              </div>
              <div className="plate reg-corners p-5 transition-colors hover:border-ink sm:p-6">
                <span className="plate-id absolute left-3 top-3">BVR-03</span>
                <div className="mx-auto mb-6 mt-4 flex h-16 w-16 items-center justify-center bg-seal text-seal-ink">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-ink">Real Defense</h3>
                <p className="text-ink-soft">MITRE ATT&CK based attack scenarios</p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
