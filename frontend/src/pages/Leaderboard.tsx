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
  if (rank === 1) return <Trophy className="h-4 w-4 text-ink" />;
  if (rank <= 3) return <Medal className="h-4 w-4 text-ink" />;
  return <User className="h-4 w-4 text-ink-soft" />;
}

export default function Leaderboard() {
  const entries = useData<LeaderboardEntry[]>(async () => {
    const res = await api.get('/xp/leaderboard');
    return res.data.leaderboard || [];
  }, [], { initial: [] });

  return (
    <section className="relative min-h-[80vh] overflow-hidden bg-stock py-14 transition-colors duration-300 sm:py-20">
      <span className="absolute left-4 top-4 font-mono text-ink opacity-50 sm:left-6 sm:top-6" aria-hidden="true">+</span>
      <span className="absolute right-4 top-4 font-mono text-ink opacity-50 sm:right-6 sm:top-6" aria-hidden="true">+</span>
      <span className="absolute bottom-4 left-4 font-mono text-ink opacity-50 sm:bottom-6 sm:left-6" aria-hidden="true">+</span>
      <span className="absolute bottom-4 right-4 font-mono text-ink opacity-50 sm:bottom-6 sm:right-6" aria-hidden="true">+</span>

      <div className="relative z-10 mx-auto max-w-3xl px-5 sm:px-8">
        <FadeIn className="mb-10 text-center">
          <span className="register">Plate — Agent Register</span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink md:text-5xl">Leaderboard</h1>
          <p className="mt-2 text-lg text-ink-soft">Top agents ranked by XP</p>
        </FadeIn>

        <AsyncSection state={entries} onRetry={entries.reload} skeleton={<LeaderboardSkeleton />}>
          {entries.data.length === 0 ? (
            <p className="text-center text-lg text-ink-soft">No XP has been awarded yet.</p>
          ) : (
            <div className="border border-ink">
              <div className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 border-b border-ink bg-stock-drift px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft sm:grid-cols-[4rem_1fr_6rem_8rem]">
                <span>Rank</span>
                <span>Agent</span>
                <span className="hidden sm:block">Level</span>
                <span className="text-right">Marks</span>
              </div>
              <Stagger className="divide-y divide-hairline" baseDelay={0.1} increment={0.05}>
                {entries.data.map((entry) => (
                  <div
                    key={entry.user_id}
                    className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-4 py-4 transition-colors hover:bg-stock-green sm:grid-cols-[4rem_1fr_6rem_8rem]"
                  >
                    <div className="flex items-center gap-2 font-mono text-sm text-ink">
                      <RankIcon rank={entry.rank} />
                      {String(entry.rank).padStart(2, '0')}
                    </div>
                    <p className="truncate font-bold text-ink">
                      {entry.username || `User ${entry.user_id}`}
                    </p>
                    <span className="plate-id hidden w-fit sm:inline-block">LVL-{String(entry.level).padStart(2, '0')}</span>
                    <p className="text-right font-mono text-sm font-bold text-ink">
                      {entry.total_xp} <span className="register">Marks</span>
                    </p>
                  </div>
                ))}
              </Stagger>
            </div>
          )}
        </AsyncSection>

        <FadeIn className="mt-10 text-center" delay="0.4s">
          <Link
            to="/levels"
            className="inline-flex min-h-[44px] items-center bg-ink px-8 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink"
          >
            <Gamepad2 className="mr-2 h-4 w-4" /> Play Levels
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="border border-ink">
      <div className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 border-b border-ink bg-stock-drift px-4 py-3 sm:grid-cols-[4rem_1fr_6rem_8rem]">
        <div className="h-3 w-10 bg-hairline-soft" />
        <div className="h-3 w-16 bg-hairline-soft" />
        <div className="hidden h-3 w-12 bg-hairline-soft sm:block" />
        <div className="ml-auto h-3 w-12 bg-hairline-soft" />
      </div>
      <div className="divide-y divide-hairline">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-4 py-4 sm:grid-cols-[4rem_1fr_6rem_8rem]"
          >
            <div className="h-5 w-8 bg-hairline-soft" />
            <div className="h-5 w-32 bg-hairline-soft" />
            <div className="hidden h-5 w-14 bg-hairline-soft sm:block" />
            <div className="ml-auto h-6 w-20 bg-hairline-soft" />
          </div>
        ))}
      </div>
    </div>
  );
}
