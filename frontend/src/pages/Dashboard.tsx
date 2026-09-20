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
    <section className="min-h-screen bg-stock py-12 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <FadeIn className="mb-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="register">Plate 01 — Training Register</span>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
                Welcome back{user?.username ? `, ${user.username}` : ''}!
              </h1>
              <p className="mt-2 text-ink-soft">Your record of marks, streaks, and missions</p>
            </div>
            <Link
              to="/levels"
              className="inline-flex min-h-[44px] items-center bg-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink"
            >
              <PlayCircle className="mr-2 h-4 w-4" /> Continue Learning
            </Link>
          </div>
        </FadeIn>

        <Stagger className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" baseDelay={0.1} increment={0.1}>
          <AsyncSection state={progress} skeleton={<StatCardSkeleton />}>
            <StatCard icon={Star} label="Total XP" value={progress.data.total_xp} />
          </AsyncSection>
          <AsyncSection state={progress} skeleton={<StatCardSkeleton />}>
            <StatCard icon={Trophy} label="Completed Levels" value={`${progress.data.completed_levels} / ${progress.data.total_levels}`} />
          </AsyncSection>
          <AsyncSection state={progress} skeleton={<StatCardSkeleton />}>
            <StatCard icon={Flame} label="Learning Streak" value={`${streakData.learning_streak} days`} />
          </AsyncSection>
          <AsyncSection state={rank} skeleton={<StatCardSkeleton />}>
            <StatCard icon={ShieldCheck} label="Current Rank" value={rank.data} />
          </AsyncSection>
        </Stagger>

        <div className="grid gap-6 lg:grid-cols-3">
          <FadeIn className="lg:col-span-2" delay="0.5s">
            <div className="plate reg-corners p-5 sm:p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-ink">Learning Progress</h2>
                <span className="plate-id">REG-01</span>
              </div>

              <AsyncSection state={progress} skeleton={<LearningProgressSkeleton />}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="register">Overall Completion</span>
                    <span className="font-mono text-sm font-bold text-ink">{progress.data.completion_percentage}%</span>
                  </div>
                  <div className="h-2 w-full border border-hairline">
                    <div
                      className="h-full bg-ink transition-all"
                      style={{ width: `${Math.min(progress.data.completion_percentage, 100)}%` }}
                    />
                  </div>
                </div>

                <AsyncSection state={levels}>
                  <div className="mt-8 grid grid-cols-2 gap-4 border-t border-hairline pt-6 sm:grid-cols-5">
                    {levelsWithStatus.map((level) => (
                      <div key={level.level_id} className="text-center">
                        <div
                          className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center border font-mono text-sm ${
                            level.completed
                              ? 'border-confirm text-confirm'
                              : level.unlocked
                                ? 'border-ink text-ink'
                                : 'border-hairline text-ink-soft'
                          }`}
                        >
                          {level.completed ? <Check className="h-5 w-5" /> : String(level.level_id).padStart(2, '0')}
                        </div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">LVL-{String(level.level_id).padStart(2, '0')}</p>
                        {level.completed ? (
                          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-confirm">✓ Completed</p>
                        ) : level.unlocked ? (
                          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink">Available</p>
                        ) : (
                          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">Locked</p>
                        )}
                      </div>
                    ))}
                  </div>
                </AsyncSection>
              </AsyncSection>
            </div>
          </FadeIn>

          <FadeIn delay="0.6s">
            <div className="plate p-5 sm:p-6">
              <h2 className="mb-6 text-xl font-bold text-ink">Quick Actions</h2>
              <div className="space-y-3">
                {nextLevel && (
                  <Link
                    to="/levels"
                    className="flex min-h-[44px] w-full items-center justify-center bg-ink px-4 py-3 text-center font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink"
                  >
                    <PlayCircle className="mr-2 h-4 w-4" /> Start {formatDisplayName(nextLevel.name)}
                  </Link>
                )}

                {streakData.status === 'at_risk' && (
                  <div className="border border-strike p-4">
                    <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-strike">Status — At Risk</p>
                    <p className="text-sm text-ink">Your streak is at risk! Complete a level today to keep it going.</p>
                  </div>
                )}
                {streakData.status === 'broken' && (
                  <div className="border border-hairline p-4">
                    <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink">Status — Fresh Start</p>
                    <p className="text-sm text-ink">Ready for a fresh start? Begin your new learning streak today!</p>
                  </div>
                )}
                {streakData.status === 'starting' && (
                  <div className="border border-confirm p-4">
                    <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-confirm">Status — Started</p>
                    <p className="text-sm text-ink">Great start! Complete another level tomorrow to build your streak.</p>
                  </div>
                )}

                <Link
                  to="/levels"
                  className="flex min-h-[44px] w-full items-center justify-center border border-ink px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-stock-green"
                >
                  <Grid className="mr-2 h-4 w-4" /> View All Levels
                </Link>
                <Link
                  to="/profile"
                  className="flex min-h-[44px] w-full items-center justify-center border border-ink px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-stock-green"
                >
                  <User className="mr-2 h-4 w-4" /> Edit Profile
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <FadeIn delay="0.7s">
            <div className="plate p-5 sm:p-6">
              <h2 className="mb-6 flex items-center text-xl font-bold text-ink">
                <Trophy className="mr-2 h-5 w-5 text-ink" /> Recent Sessions
              </h2>

              <AsyncSection state={sessions} skeleton={<SessionListSkeleton />}>
                {sessions.data.length > 0 ? (
                  <div className="divide-y divide-hairline border border-hairline">
                    {sessions.data.slice(0, 5).map((session) => (
                      <div
                        key={session.id}
                        className="flex cursor-pointer items-center justify-between gap-3 p-3 transition-colors hover:bg-stock-green"
                      >
                        <div className="flex items-center">
                          <div className="mr-3 flex h-12 w-12 flex-shrink-0 items-center justify-center border border-ink font-mono text-xs font-bold text-ink">
                            {session.score ?? 0}%
                          </div>
                          <div>
                            <p className="font-semibold text-ink">{formatDisplayName(session.session_name)}</p>
                            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                              {formatDate(session.created_at)} &bull; {formatTime(session.time_spent)}
                            </p>
                          </div>
                        </div>
                        <span className="plate-id hidden sm:inline-block">SES-{String(session.id).padStart(2, '0')}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <ClipboardIcon />
                    <p className="text-ink-soft">No sessions yet</p>
                    <p className="text-sm text-ink-soft">Start your first learning session to see your progress here!</p>
                  </div>
                )}
              </AsyncSection>
            </div>
          </FadeIn>

          <FadeIn delay="0.8s">
            <div className="plate p-5 sm:p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center text-xl font-bold text-ink">
                  <Star className="mr-2 h-5 w-5 text-ink" /> XP Activity
                </h2>
                <span className="register">
                  Marks Gained <span className="ml-1 font-mono text-sm font-bold tracking-normal text-confirm">+{xpTotal}</span>
                </span>
              </div>

              <AsyncSection state={rawXP} skeleton={<XPActivitySkeleton />}>
                <AsyncSection state={sessions}>
                  {recentXP.length > 0 ? (
                    <div className="divide-y divide-hairline border border-hairline">
                      {recentXP.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-3"
                        >
                          <div className="flex items-center">
                            <div
                              className={`mr-3 flex h-12 w-12 flex-shrink-0 items-center justify-center border font-mono text-xs font-bold ${
                                (entry.xp_change || 0) > 0 ? 'border-confirm text-confirm' : 'border-strike text-strike'
                              }`}
                            >
                              {(entry.xp_change || 0) > 0 ? '+' : ''}{entry.xp_change}
                            </div>
                            <div>
                              <p className="font-semibold text-ink">{formatReason(entry.reason)}</p>
                              {entry.created_at && (
                                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">{formatDate(entry.created_at)}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <TrendingUp className="mx-auto mb-3 h-12 w-12 text-ink-soft" />
                      <p className="text-ink-soft">No XP activity yet</p>
                      <p className="text-sm text-ink-soft">Start completing levels to earn XP!</p>
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
}: {
  icon: typeof Star;
  label: string;
  value: string | number;
}) {
  return (
    <div className="plate p-5 transition-colors hover:border-ink">
      <div className="mb-4 flex h-10 w-10 items-center justify-center border border-hairline text-ink">
        <Icon className="h-5 w-5" />
      </div>
      <p className="register">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight text-ink">{value}</p>
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
    <svg className="mx-auto mb-3 h-12 w-12 text-ink-soft" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h.01M15 12h.01M12 21a9 9 0 100-18 9 9 0 000 18z" />
    </svg>
  );
}


function StatCardSkeleton() {
  return (
    <div className="plate p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center border border-hairline">
        <div className="h-5 w-5 bg-hairline-soft" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-20 bg-hairline-soft" />
        <div className="h-8 w-16 bg-hairline-soft" />
      </div>
    </div>
  );
}

function LearningProgressSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 bg-hairline-soft" />
        <div className="h-4 w-12 bg-hairline-soft" />
      </div>
      <div className="h-2 w-full border border-hairline bg-hairline-soft" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="text-center">
            <div className="mx-auto mb-2 h-12 w-12 border border-hairline bg-hairline-soft" />
            <div className="mx-auto h-3 w-12 bg-hairline-soft" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionListSkeleton() {
  return (
    <div className="divide-y divide-hairline border border-hairline">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 border border-hairline bg-hairline-soft" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-hairline-soft" />
              <div className="h-3 w-24 bg-hairline-soft" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function XPActivitySkeleton() {
  return (
    <div className="divide-y divide-hairline border border-hairline">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 border border-hairline bg-hairline-soft" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-hairline-soft" />
              <div className="h-3 w-24 bg-hairline-soft" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
