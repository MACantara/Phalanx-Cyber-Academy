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

const DIFFICULTY_COLORS: Record<string, string> = {
  'Beginner': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Easy': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Intermediate': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Hard': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'Advanced': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
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
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 transition-colors dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Cybersecurity <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Levels</span>
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300">
            Master cybersecurity through gamified challenges. Complete levels to unlock new skills and advance your digital defense expertise.
          </p>
        </FadeIn>

        <FadeIn className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <AsyncSection state={progress} onRetry={progress.reload} skeleton={<YourProgressSkeleton />}>
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Your Progress</h2>
                <div className="flex flex-wrap items-center gap-6">
                  <span className="flex items-center text-gray-600 dark:text-gray-300">
                    <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                    Completed: <strong className="ml-1 text-gray-900 dark:text-white">{progress.data.completed_levels}/{progress.data.total_levels}</strong>
                  </span>
                  <span className="flex items-center text-gray-600 dark:text-gray-300">
                    <StarIcon />
                    Total XP: <strong className="ml-1 text-gray-900 dark:text-white">{progress.data.total_xp}</strong>
                  </span>
                </div>
              </div>
              <div className="w-full text-center sm:w-48 sm:text-right">
                <div className="mb-1 text-sm text-gray-500 dark:text-gray-400">Overall Progress</div>
                <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all"
                    style={{ width: `${Math.min(progress.data.completion_percentage, 100)}%` }}
                  />
                </div>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">{Math.round(progress.data.completion_percentage)}% Complete</div>
              </div>
            </div>
          </AsyncSection>
        </FadeIn>

        <FadeIn className="mb-8" delay="0.2s">
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-6 text-gray-900 shadow-lg transition-colors dark:border-gray-700 dark:from-slate-900 dark:to-blue-900 dark:text-white sm:p-8">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-between">
              <div className="text-center md:text-left">
                <div className="mb-3 flex justify-center gap-3 md:justify-start">
                  <Shield className="h-10 w-10 text-green-500 dark:text-green-400" />
                  <Sword className="h-10 w-10 text-red-500 dark:text-red-400" />
                </div>
                <h2 className="mb-2 text-2xl font-bold">Blue Team vs Red Team</h2>
                <p className="max-w-2xl text-gray-600 dark:text-slate-200">
                  Defend Project Sentinel Academy against adaptive AI attacks in a live cyberwarfare simulation.
                </p>
              </div>
              <Link
                to="/blue-vs-red"
                className="inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700"
              >
                <Sword className="mr-2 h-5 w-5" /> Start Simulation <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid gap-4 text-left sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/70">
                <h3 className="mb-2 text-lg font-bold text-green-600 dark:text-green-300">Blue Team</h3>
                <ul className="list-disc space-y-1 pl-4 text-sm text-gray-600 dark:text-slate-300">
                  <li>Monitor systems and alerts</li>
                  <li>Apply patches and defenses</li>
                  <li>Contain breaches and restore services</li>
                </ul>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/70">
                <h3 className="mb-2 text-lg font-bold text-red-600 dark:text-red-300">Red Team</h3>
                <ul className="list-disc space-y-1 pl-4 text-sm text-gray-600 dark:text-slate-300">
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
                  const borderColor = completed
                    ? 'border-green-400 dark:border-green-500'
                    : comingSoon
                      ? 'border-purple-400 dark:border-purple-500'
                      : 'border-blue-400 dark:border-blue-500';
                  const iconGradient = completed
                    ? 'from-green-500 to-emerald-600'
                    : comingSoon
                      ? 'from-purple-500 to-indigo-600'
                      : 'from-blue-500 to-purple-600';

                  return (
                    <div
                      key={level.id}
                      data-level-id={level.level_id}
                      className={`group relative rounded-2xl border ${borderColor} bg-white shadow-lg transition-all hover:-translate-y-1 dark:bg-gray-800`}
                    >
                      <div className="p-6">
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex items-center">
                            <div className={`mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${iconGradient} text-white shadow-md`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Level {level.level_id}</p>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{level.name}</h3>
                              {completed && (
                                <p className="mt-1 flex items-center text-xs font-medium text-green-600 dark:text-green-400">
                                  <CheckCircle className="mr-1 h-3 w-3" /> Completed
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-xl">
                            {completed ? (
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            ) : comingSoon ? (
                              <Clock className="h-6 w-6 text-purple-500" />
                            ) : locked ? (
                              <Lock className="h-6 w-6 text-gray-400" />
                            ) : (
                              <Lock className="h-6 w-6 text-blue-500" />
                            )}
                          </div>
                        </div>

                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">{level.description}</p>

                        <div className="mb-4 space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Difficulty:</span>
                            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${DIFFICULTY_COLORS[level.difficulty] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                              {level.difficulty}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 dark:text-gray-400">XP Reward:</span>
                            <span className="font-medium text-blue-600 dark:text-blue-400">
                              {level.level_id <= 4 ? (
                                <span className="cursor-help" title="XP reward varies based on your performance: speed, accuracy, and completion time">
                                  Performance-based
                                </span>
                              ) : (
                                `${level.xp_reward} XP`
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Time:</span>
                            <span className="text-gray-700 dark:text-gray-300">{level.estimated_time || '10 min'}</span>
                          </div>
                        </div>

                        {level.skills && level.skills.length > 0 && (
                          <div className="mb-4">
                            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Skills you'll learn:</p>
                            <div className="flex flex-wrap gap-1">
                              {level.skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
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
                            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:from-green-700 hover:to-emerald-700"
                          >
                            <PlayCircle className="mr-2 h-5 w-5" /> Replay Level
                          </Link>
                        ) : comingSoon ? (
                          <button
                            disabled
                            className="flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-3 font-semibold text-white opacity-80"
                          >
                            <Clock className="mr-2 h-5 w-5" /> Coming Soon
                          </button>
                        ) : locked ? (
                          <button
                            disabled
                            className="flex w-full items-center justify-center rounded-xl bg-gray-500 px-4 py-3 font-semibold text-white opacity-70"
                          >
                            <Lock className="mr-2 h-5 w-5" /> Locked
                          </button>
                        ) : (
                          <Link
                            to={`/levels/${level.level_id}`}
                            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700"
                          >
                            <PlayCircle className="mr-2 h-5 w-5" /> Start Level
                          </Link>
                        )}
                      </div>
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
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div className="w-full space-y-3 sm:w-auto">
        <div className="h-8 w-48 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="flex flex-wrap items-center gap-6">
          <div className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-5 w-28 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
      <div className="w-full space-y-2 sm:w-48">
        <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-700 ml-auto" />
        <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700 ml-auto" />
      </div>
    </div>
  );
}

function LevelCardSkeleton() {
  return (
    <div className="rounded-2xl border border-blue-400 bg-white p-6 shadow-lg transition-all hover:-translate-y-1 dark:border-blue-500 dark:bg-gray-800">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center">
          <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md">
            <div className="h-6 w-6 rounded bg-white/30" />
          </div>
          <div>
            <div className="mb-1 h-4 w-20 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-1 h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
        <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700" />
      </div>

      <div className="mb-4 space-y-2">
        <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />
      </div>

      <div className="mb-4 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>

      <div className="mb-2 h-3 w-28 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mb-4 flex flex-wrap gap-1">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-1" />
        ))}
      </div>

      <div className="h-10 w-full rounded-xl bg-slate-200 dark:bg-slate-700" />
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
    <svg className="mr-2 h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.26.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.55-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}
