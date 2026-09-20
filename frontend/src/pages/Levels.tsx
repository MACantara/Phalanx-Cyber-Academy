import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useData } from '../hooks/useData';
import AsyncSection from '../components/AsyncSection';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Lock,
  MailWarning,
  Newspaper,
  PlayCircle,
  Shield,
  Sword,
  Terminal,
  Trophy,
  Bug,
} from 'lucide-react';
import { FadeIn, Stagger } from '../components/Animated';
import type { Level } from '../types';

const ICONS: Record<string, typeof Shield> = {
  'Information Literacy': Newspaper,
  'Email Security': MailWarning,
  'Threat Detection': Bug,
  'Ethical Hacking': Terminal,
  'Digital Forensics': Trophy,
  'Default': Shield,
};

const ICON_BY_NAME: Record<string, typeof Shield> = {
  'bi-newspaper': Newspaper,
  'bi-envelope-exclamation': MailWarning,
  'bi-bug': Bug,
  'bi-terminal': Terminal,
  'bi-trophy': Trophy,
  'bi-shield-check': Shield,
};

const DIFFICULTY_STYLES: Record<string, string> = {
  'Beginner': 'text-confirm',
  'Easy': 'text-confirm',
  'Medium': 'text-ink',
  'Intermediate': 'text-ink',
  'Hard': 'text-strike',
  'Advanced': 'text-strike',
};

interface ProgressData {
  completed_levels: number;
  total_levels: number;
  total_xp: number;
  completion_percentage: number;
  completed_level_ids: number[];
}

const initialProgress: ProgressData = {
  completed_levels: 0,
  total_levels: 0,
  total_xp: 0,
  completion_percentage: 0,
  completed_level_ids: [],
};

export default function Levels() {
  const progress = useData<ProgressData>(async () => {
    const res = await api.get('/sessions/progress');
    return res.data;
  }, [], { initial: initialProgress });

  const levels = useData<Level[]>(async () => {
    const res = await api.get('/levels/');
    return res.data.levels || [];
  }, [], { initial: [] });

  const completedIds = new Set<number>(progress.data.completed_level_ids);

  return (
    <section className="min-h-screen bg-stock py-14 transition-colors duration-300 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <FadeIn className="mb-12 text-center">
          <span className="register">Plate 02 — Level Register</span>
          <h1 className="mb-4 mt-3 text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
            Cybersecurity Levels
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-ink-soft">
            Complete missions to clear the register. Each level is a scored scenario inside the simulated PC.
          </p>
        </FadeIn>

        <FadeIn className="plate mb-8 p-5 sm:p-6">
          <AsyncSection state={progress} onRetry={progress.reload} skeleton={<YourProgressSkeleton />}>
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-ink">Your Progress</h2>
                <div className="flex flex-wrap items-center gap-6">
                  <span className="flex items-center text-ink-soft">
                    <Trophy className="mr-2 h-4 w-4 text-ink" />
                    <span className="register">Completed</span>
                    <strong className="ml-2 font-mono text-sm text-ink">{progress.data.completed_levels}/{progress.data.total_levels}</strong>
                  </span>
                  <span className="flex items-center text-ink-soft">
                    <StarIcon />
                    <span className="register">Marks</span>
                    <strong className="ml-2 font-mono text-sm text-ink">{progress.data.total_xp}</strong>
                  </span>
                </div>
              </div>
              <div className="w-full sm:w-48 sm:text-right">
                <div className="mb-1 register">Overall Progress</div>
                <div className="h-2 w-full border border-hairline">
                  <div
                    className="h-full bg-ink transition-all"
                    style={{ width: `${Math.min(progress.data.completion_percentage, 100)}%` }}
                  />
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">{Math.round(progress.data.completion_percentage)}% Complete</div>
              </div>
            </div>
          </AsyncSection>
        </FadeIn>

        <FadeIn className="mb-8" delay="0.2s">
          <div className="plate reg-corners p-5 text-ink sm:p-8">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-between">
              <div className="text-center md:text-left">
                <div className="mb-3 flex justify-center gap-3 md:justify-start">
                  <Shield className="h-10 w-10 text-confirm" />
                  <Sword className="h-10 w-10 text-strike" />
                </div>
                <span className="plate-id">SIM-01</span>
                <h2 className="mb-2 mt-2 text-2xl font-bold">Blue Team vs Red Team</h2>
                <p className="max-w-2xl text-ink-soft">
                  Defend Project Sentinel Academy against adaptive AI attacks in a live cyberwarfare simulation.
                </p>
              </div>
              <Link
                to="/blue-vs-red"
                className="inline-flex min-h-[44px] items-center bg-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink"
              >
                <Sword className="mr-2 h-4 w-4" /> Start Simulation <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid gap-4 text-left sm:grid-cols-2">
              <div className="border border-hairline p-4">
                <h3 className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-confirm">Blue Team</h3>
                <ul className="list-disc space-y-1 pl-4 text-sm text-ink-soft">
                  <li>Monitor systems and alerts</li>
                  <li>Apply patches and defenses</li>
                  <li>Contain breaches and restore services</li>
                </ul>
              </div>
              <div className="border border-hairline p-4">
                <h3 className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-strike">Red Team</h3>
                <ul className="list-disc space-y-1 pl-4 text-sm text-ink-soft">
                  <li>Launch simulated attacks</li>
                  <li>Exploit vulnerabilities</li>
                  <li>Disrupt defender operations</li>
                </ul>
              </div>
            </div>
          </div>
        </FadeIn>

        <AsyncSection state={levels} onRetry={levels.reload} skeleton={<LevelsSkeleton />}>
            <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" baseDelay={0.1} increment={0.1}>
              {levels.data
                .filter((l) => !l.coming_soon || completedIds.has(l.level_id))
                .map((level) => {
                  const Icon = ICON_BY_NAME[level.icon || ''] || ICONS[level.category || 'Default'] || Shield;
                  const completed = completedIds.has(level.level_id);
                  const comingSoon = level.coming_soon;
                  const locked = !level.unlocked && !comingSoon;

                  return (
                    <div
                      key={level.id}
                      data-level-id={level.level_id}
                      className="plate reg-corners group p-5 transition-colors hover:border-ink sm:p-6"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center border border-hairline text-ink">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="plate-id">LVL-{String(level.level_id).padStart(2, '0')}</span>
                      </div>

                      <h3 className="text-lg font-bold text-ink">{level.name}</h3>
                      <p className={`mb-4 mt-1 flex items-center font-mono text-[10px] uppercase tracking-[0.14em] ${
                        completed ? 'text-confirm' : comingSoon ? 'text-ink-soft' : locked ? 'text-ink-soft' : 'text-ink'
                      }`}>
                        {completed ? (
                          <><CheckCircle className="mr-1 h-3 w-3" /> Completed</>
                        ) : comingSoon ? (
                          <><Clock className="mr-1 h-3 w-3" /> Coming Soon</>
                        ) : locked ? (
                          <><Lock className="mr-1 h-3 w-3" /> Locked</>
                        ) : (
                          'Available'
                        )}
                      </p>

                      <p className="mb-4 text-sm text-ink-soft">{level.description}</p>

                      <div className="mb-4 space-y-2 border-t border-hairline pt-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="register">Difficulty</span>
                          <span className={`font-mono text-[10px] uppercase tracking-[0.14em] ${DIFFICULTY_STYLES[level.difficulty] || 'text-ink-soft'}`}>
                            {level.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="register">XP Reward</span>
                          <span className="font-mono text-xs text-ink">
                            {level.level_id <= 4 ? (
                              <span className="cursor-help" title="XP reward varies based on your performance: speed, accuracy, and completion time">
                                Performance-based
                              </span>
                            ) : (
                              `MARKS ${level.xp_reward}`
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="register">Time</span>
                          <span className="font-mono text-xs text-ink">{level.estimated_time || '10 min'}</span>
                        </div>
                      </div>

                      {level.skills && level.skills.length > 0 && (
                        <div className="mb-4">
                          <p className="mb-2 register">Skills you'll learn</p>
                          <div className="flex flex-wrap gap-1">
                            {level.skills.map((skill) => (
                              <span
                                key={skill}
                                className="border border-hairline px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {completed ? (
                        <Link
                          to={`/levels/${level.level_id}`}
                          className="flex min-h-[44px] w-full items-center justify-center border border-ink px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-stock-green"
                        >
                          <PlayCircle className="mr-2 h-4 w-4" /> Replay Level
                        </Link>
                      ) : comingSoon ? (
                        <button
                          disabled
                          className="flex min-h-[44px] w-full cursor-not-allowed items-center justify-center border border-hairline px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink-soft opacity-60"
                        >
                          <Clock className="mr-2 h-4 w-4" /> Coming Soon
                        </button>
                      ) : locked ? (
                        <button
                          disabled
                          className="flex min-h-[44px] w-full cursor-not-allowed items-center justify-center border border-hairline px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink-soft opacity-60"
                        >
                          <Lock className="mr-2 h-4 w-4" /> Locked
                        </button>
                      ) : (
                        <Link
                          to={`/levels/${level.level_id}`}
                          className="flex min-h-[44px] w-full items-center justify-center bg-ink px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink"
                        >
                          <PlayCircle className="mr-2 h-4 w-4" /> Start Level
                        </Link>
                      )}
                    </div>
                  );
                })}
            </Stagger>
          </AsyncSection>
      </div>
    </section>
  );
}

function YourProgressSkeleton() {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
      <div className="w-full space-y-3 sm:w-auto">
        <div className="h-8 w-48 bg-hairline-soft" />
        <div className="flex flex-wrap items-center gap-6">
          <div className="h-5 w-32 bg-hairline-soft" />
          <div className="h-5 w-28 bg-hairline-soft" />
        </div>
      </div>
      <div className="w-full space-y-2 sm:w-48">
        <div className="h-4 w-28 bg-hairline-soft sm:ml-auto" />
        <div className="h-2 w-full border border-hairline bg-hairline-soft" />
        <div className="h-4 w-16 bg-hairline-soft sm:ml-auto" />
      </div>
    </div>
  );
}

function LevelCardSkeleton() {
  return (
    <div className="plate p-5 sm:p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center border border-hairline">
          <div className="h-5 w-5 bg-hairline-soft" />
        </div>
        <div className="h-5 w-14 bg-hairline-soft" />
      </div>

      <div className="mb-1 h-5 w-32 bg-hairline-soft" />
      <div className="mb-4 h-3 w-24 bg-hairline-soft" />

      <div className="mb-4 space-y-2">
        <div className="h-4 w-full bg-hairline-soft" />
        <div className="h-4 w-5/6 bg-hairline-soft" />
      </div>

      <div className="mb-4 space-y-2 border-t border-hairline pt-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 bg-hairline-soft" />
          <div className="h-4 w-20 bg-hairline-soft" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-hairline-soft" />
          <div className="h-4 w-16 bg-hairline-soft" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 w-16 bg-hairline-soft" />
          <div className="h-4 w-20 bg-hairline-soft" />
        </div>
      </div>

      <div className="mb-2 h-3 w-28 bg-hairline-soft" />
      <div className="mb-4 flex flex-wrap gap-1">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-6 w-16 border border-hairline bg-hairline-soft px-2 py-1" />
        ))}
      </div>

      <div className="h-11 w-full bg-hairline-soft" />
    </div>
  );
}

function LevelsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <LevelCardSkeleton key={i} />
      ))}
    </div>
  );
}

function StarIcon() {
  return (
    <svg className="mr-2 h-4 w-4 text-ink" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.26.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.55-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}
