import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useData } from '../hooks/useData';
import AsyncSection from '../components/AsyncSection';
import { FadeIn, Stagger } from '../components/Animated';
import { Trophy, Medal, User, Gamepad2 } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string | null;
  total_xp: number;
  level: number;
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-400" />;
  if (rank <= 3) return <Medal className="h-5 w-5 text-blue-300" />;
  return <User className="h-5 w-5 text-white/80" />;
}

export default function Leaderboard() {
  const entries = useData<LeaderboardEntry[]>(async () => {
    const res = await api.get('/xp/leaderboard');
    return res.data.leaderboard || [];
  }, [], { initial: [] });

  return (
    <section className="relative min-h-[80vh] overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 py-20 transition-colors dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-pulse rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 animate-pulse rounded-full bg-purple-400/20 blur-3xl" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">Leaderboard</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Top agents ranked by XP</p>
        </FadeIn>

        <AsyncSection state={entries} onRetry={entries.reload} skeleton={<LeaderboardSkeleton />}>
          {entries.data.length === 0 ? (
            <p className="text-center text-lg text-gray-600 dark:text-gray-300">No XP has been awarded yet.</p>
          ) : (
            <Stagger className="space-y-4" baseDelay={0.1} increment={0.05}>
              {entries.data.map((entry) => (
                <div
                  key={entry.user_id}
                  className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-lg transition-all hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md">
                      <RankIcon rank={entry.rank} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {entry.username || `User ${entry.user_id}`}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Level {entry.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {entry.total_xp} <span className="text-sm font-medium text-blue-600 dark:text-blue-400">XP</span>
                    </p>
                  </div>
                </div>
              ))}
            </Stagger>
          )}
        </AsyncSection>

        <FadeIn className="mt-10 text-center" delay="0.4s">
          <Link
            to="/levels"
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700"
          >
            <Gamepad2 className="mr-2 h-5 w-5" /> Play Levels
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md">
              <div className="h-5 w-5 rounded-full bg-white/30" />
            </div>
            <div>
              <div className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-1 h-4 w-16 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
          <div className="h-6 w-20 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  );
}
