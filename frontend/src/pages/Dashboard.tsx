import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useData } from '../hooks/useData';
import AsyncSection from '../components/AsyncSection';
import { FadeIn, Stagger } from '../components/Animated';
import {
  Check,
  Flame,
  Grid,
  PlayCircle,
  ShieldCheck,
  Star,
  TrendingUp,
  Trophy,
  User,
} from 'lucide-react';

interface ProgressData {
  completed_levels: number;
  total_levels: number;
  completion_percentage: number;
  best_scores: Record<string, { score: number; time: number }>;
  completed_level_ids: number[];
  total_xp: number;
  user_id: string;
}

interface LevelData {
  level_id: number;
  name: string;
  unlocked: boolean;
  coming_soon?: boolean;
}

interface SessionData {
  id: number;
  session_name: string;
  score: number | null;
  time_spent: number;
  created_at: string;
}

interface XPEntry {
  id: number;
  xp_change: number;
  reason: string;
  session_id: number;
  created_at: string;
}

interface LeaderboardEntry {
  rank: number;
  user_id: string;
}

const initialProgress: ProgressData = {
  completed_levels: 0,
  total_levels: 10,
  completion_percentage: 0,
  best_scores: {},
  completed_level_ids: [],
  total_xp: 0,
  user_id: '',
};

const placeholderLevels: LevelData[] = Array.from({ length: 10 }, (_, i) => ({
  level_id: i + 1,
  name: `Level ${i + 1}`,
  unlocked: i < 2,
  coming_soon: false,
}));

const placeholderSessions: SessionData[] = [
  {
    id: 1,
    session_name: 'Sample Session',
    score: 85,
    time_spent: 120,
    created_at: new Date().toISOString(),
  },
];

const placeholderXP: XPEntry[] = [
  {
    id: 1,
    xp_change: 25,
    reason: 'completed_level',
    session_id: 1,
    created_at: new Date().toISOString(),
  },
];

const initialRank = 1;

export default function Dashboard() {
  const { user } = useAuth();

  const progress = useData<ProgressData>(
    async () => {
      const res = await api.get('/sessions/progress');
      return res.data;
    },
    [],
    { initial: initialProgress }
  );

  const levels = useData<LevelData[]>(
    async () => {
      const res = await api.get('/levels');
      return res.data.levels || [];
    },
    [],
    { initial: placeholderLevels }
  );

  const sessions = useData<SessionData[]>(
    async () => {
      const res = await api.get('/sessions?limit=5');
      return res.data.sessions || [];
    },
    [],
    { initial: placeholderSessions }
  );

  const rawXP = useData<XPEntry[]>(
    async () => {
      const res = await api.get('/xp/history?limit=50');
      return res.data.history || [];
    },
    [],
    { initial: placeholderXP }
  );

  const rank = useData<number>(
    async () => {
      if (!user) return initialRank;
      const res = await api.get('/xp/leaderboard?limit=100');
      const me = res.data.leaderboard.find((e: LeaderboardEntry) => e.user_id === user.id);
      return me ? me.rank : initialRank;
    },
    [user],
    { initial: initialRank }
  );

  const completedIds = useMemo(
    () => new Set<number>(progress.data.completed_level_ids),
    [progress.data.completed_level_ids]
  );

  const levelsWithStatus = useMemo(
    () =>
      levels.data
        .filter((l) => !l.coming_soon)
        .sort((a, b) => a.level_id - b.level_id)
        .map((level) => ({
          ...level,
          completed: completedIds.has(level.level_id),
        })),
    [levels.data, completedIds]
  );

  const nextLevel = useMemo(
    () => levelsWithStatus.find((l) => l.unlocked && !l.completed),
    [levelsWithStatus]
  );

  const recentXP = useMemo(() => {
    const sessionIds = new Set<number>(sessions.data.map((s) => s.id));
    return rawXP.data.filter((entry) => sessionIds.has(entry.session_id)).slice(0, 5);
  }, [sessions.data, rawXP.data]);

  const xpTotal = useMemo(() => recentXP.reduce((sum, e) => sum + (e.xp_change || 0), 0), [recentXP]);

  const streakData = {
    status: 'no_activity',
    learning_streak: 0,
    longest_streak: 0,
  } as { status: string; learning_streak: number; longest_streak: number };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 py-12 transition-colors dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                Welcome back{user?.username ? `, ${user.username}` : ''}!
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Track your cybersecurity learning progress and achievements</p>
            </div>
            <Link
              to="/levels"
              className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white shadow-lg transition-colors hover:bg-blue-700"
            >
              <PlayCircle className="mr-2 h-5 w-5" /> Continue Learning
            </Link>
          </div>
        </FadeIn>

        <Stagger className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" baseDelay={0.1} increment={0.1}>
          <AsyncSection state={progress} skeleton={<StatCardSkeleton color="blue" />}>
            <StatCard icon={Star} label="Total XP" value={progress.data.total_xp} color="blue" />
          </AsyncSection>
          <AsyncSection state={progress} skeleton={<StatCardSkeleton color="green" />}>
            <StatCard icon={Trophy} label="Completed Levels" value={`${progress.data.completed_levels} / ${progress.data.total_levels}`} color="green" />
          </AsyncSection>
          <AsyncSection state={progress} skeleton={<StatCardSkeleton color="orange" />}>
            <StatCard icon={Flame} label="Learning Streak" value={`${streakData.learning_streak} days`} color="orange" />
          </AsyncSection>
          <AsyncSection state={rank} skeleton={<StatCardSkeleton color="purple" />}>
            <StatCard icon={ShieldCheck} label="Current Rank" value={rank.data} color="purple" />
          </AsyncSection>
        </Stagger>

        <div className="grid gap-8 lg:grid-cols-3">
          <FadeIn className="lg:col-span-2" delay="0.5s">
            <div className="rounded-2xl border border-white/20 bg-white/70 p-6 shadow-lg backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/70">
              <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">Learning Progress</h2>

              <AsyncSection state={progress} skeleton={<LearningProgressSkeleton />}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Overall Completion</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{progress.data.completion_percentage}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all"
                      style={{ width: `${Math.min(progress.data.completion_percentage, 100)}%` }}
                    />
                  </div>
                </div>

                <AsyncSection state={levels}>
                  <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
                    {levelsWithStatus.map((level) => (
                      <div key={level.level_id} className="text-center">
                        <div
                          className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg text-sm font-bold text-white ${
                            level.completed
                              ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                              : level.unlocked
                                ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                                : 'bg-gray-400 dark:bg-gray-600'
                          }`}
                        >
                          {level.completed ? <Check className="h-5 w-5" /> : level.level_id}
                        </div>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Level {level.level_id}</p>
                        {level.completed ? (
                          <p className="text-xs text-green-600 dark:text-green-400">Completed</p>
                        ) : level.unlocked ? (
                          <p className="text-xs text-blue-600 dark:text-blue-400">Available</p>
                        ) : (
                          <p className="text-xs text-gray-400">Locked</p>
                        )}
                      </div>
                    ))}
                  </div>
                </AsyncSection>
              </AsyncSection>
            </div>
          </FadeIn>

          <FadeIn delay="0.6s">
            <div className="rounded-2xl border border-white/20 bg-white/70 p-6 shadow-lg backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/70">
              <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
              <div className="space-y-4">
                {nextLevel && (
                  <Link
                    to="/levels"
                    className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-center font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    <PlayCircle className="mr-2 h-5 w-5" /> Start {formatDisplayName(nextLevel.name)}
                  </Link>
                )}

                {streakData.status === 'at_risk' && (
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
                    Your streak is at risk! Complete a level today to keep it going.
                  </div>
                )}
                {streakData.status === 'broken' && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                    Ready for a fresh start? Begin your new learning streak today!
                  </div>
                )}
                {streakData.status === 'starting' && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300">
                    Great start! Complete another level tomorrow to build your streak.
                  </div>
                )}

                <Link
                  to="/levels"
                  className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                >
                  <Grid className="mr-2 h-5 w-5" /> View All Levels
                </Link>
                <Link
                  to="/profile"
                  className="flex w-full items-center justify-center rounded-xl bg-gray-600 px-4 py-3 font-medium text-white transition-colors hover:bg-gray-700"
                >
                  <User className="mr-2 h-5 w-5" /> Edit Profile
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <FadeIn delay="0.7s">
            <div className="rounded-2xl border border-white/20 bg-white/70 p-6 shadow-lg backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/70">
              <h2 className="mb-6 flex items-center text-xl font-bold text-gray-900 dark:text-white">
                <Trophy className="mr-2 h-6 w-6 text-green-500" /> Recent Sessions
              </h2>

              <AsyncSection state={sessions} skeleton={<SessionListSkeleton />}>
                {sessions.data.length > 0 ? (
                  <div className="space-y-4">
                    {sessions.data.slice(0, 5).map((session) => (
                      <div
                        key={session.id}
                        className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
                      >
                        <div className="flex items-center">
                          <div className="mr-3 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-sm font-bold text-white">
                            {session.score ?? 0}%
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{formatDisplayName(session.session_name)}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(session.created_at)} &bull; {formatTime(session.time_spent)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <ClipboardIcon />
                    <p className="text-gray-500 dark:text-gray-400">No sessions yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Start your first learning session to see your progress here!</p>
                  </div>
                )}
              </AsyncSection>
            </div>
          </FadeIn>

          <FadeIn delay="0.8s">
            <div className="rounded-2xl border border-white/20 bg-white/70 p-6 shadow-lg backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/70">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center text-xl font-bold text-gray-900 dark:text-white">
                  <Star className="mr-2 h-6 w-6 text-blue-500" /> XP Activity
                </h2>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total Gained: <span className="text-lg font-bold text-green-600 dark:text-green-400">+{xpTotal}</span>
                </span>
              </div>

              <AsyncSection state={rawXP} skeleton={<XPActivitySkeleton />}>
                <AsyncSection state={sessions}>
                  {recentXP.length > 0 ? (
                    <div className="space-y-4">
                      {recentXP.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
                        >
                          <div className="flex items-center">
                            <div
                              className={`mr-3 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg font-bold text-white ${
                                (entry.xp_change || 0) > 0 ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-red-600'
                              }`}
                            >
                              {(entry.xp_change || 0) > 0 ? '+' : ''}{entry.xp_change}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{formatReason(entry.reason)}</p>
                              {entry.created_at && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(entry.created_at)}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <TrendingUp className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                      <p className="text-gray-500 dark:text-gray-400">No XP activity yet</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">Start completing levels to earn XP!</p>
                    </div>
                  )}
                </AsyncSection>
              </AsyncSection>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Star;
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'orange' | 'purple';
}) {
  const icons = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return (
    <div className="rounded-2xl border border-white/20 bg-white/70 p-6 shadow-lg backdrop-blur-md transition-transform hover:-translate-y-1 dark:border-gray-700 dark:bg-gray-800/70">
      <div className="flex items-center">
        <div className={`mr-4 flex h-12 w-12 items-center justify-center rounded-full ${icons[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  if (!seconds) return '0s';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDate(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDisplayName(name: string): string {
  if (!name) return '';
  return name.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatReason(reason: string): string {
  return (reason || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function ClipboardIcon() {
  return (
    <svg className="mx-auto mb-3 h-12 w-12 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h.01M15 12h.01M12 21a9 9 0 100-18 9 9 0 000 18z" />
    </svg>
  );
}


function StatCardSkeleton({ color }: { color: 'blue' | 'green' | 'orange' | 'purple' }) {
  const icons = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return (
    <div className="rounded-2xl border border-white/20 bg-white/70 p-6 shadow-lg backdrop-blur-md transition-transform dark:border-gray-700 dark:bg-gray-800/70">
      <div className="flex items-center">
        <div className={`mr-4 flex h-12 w-12 items-center justify-center rounded-full ${icons[color]}`}>
          <div className="h-6 w-6 rounded-full bg-current opacity-30" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-8 w-16 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  );
}

function LearningProgressSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="text-center">
            <div className="mx-auto mb-2 h-12 w-12 rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="mx-auto h-3 w-12 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function XPActivitySkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
