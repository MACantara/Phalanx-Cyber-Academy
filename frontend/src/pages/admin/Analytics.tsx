import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useData } from '../../hooks/useData';
import AsyncSection from '../../components/AsyncSection';
import { FadeIn } from '../../components/Animated';
import { ArrowLeft, BarChart3, Layers, Trophy, Target } from 'lucide-react';

interface LevelStat {
  level_id: number;
  sessions: number;
  completed: number;
  average_score: number;
}

interface DashboardStats {
  total_users: number;
  recent_signups: number;
  total_sessions: number;
  completed_sessions: number;
  average_score: number;
}

const initialDashboard: DashboardStats = {
  total_users: 0,
  recent_signups: 0,
  total_sessions: 0,
  completed_sessions: 0,
  average_score: 0,
};

const StatCard = ({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string | number }) => (
  <div className="plate p-4 transition-colors hover:border-ink">
    <div className="mb-4 flex h-10 w-10 items-center justify-center bg-seal text-seal-ink">
      <Icon className="h-5 w-5" />
    </div>
    <p className="register">{label}</p>
    <p className="mt-1 text-3xl font-bold tracking-tight text-ink">{value}</p>
  </div>
);

export default function Analytics() {
  const dashboard = useData<DashboardStats>(async () => {
    const res = await api.get('/admin/analytics/dashboard');
    return res.data;
  }, [], { initial: initialDashboard });

  const levels = useData<LevelStat[]>(async () => {
    const res = await api.get('/admin/analytics/levels');
    return res.data.levels || [];
  }, [], { initial: [] });

  return (
    <section className="min-h-[80vh] bg-stock py-12">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <FadeIn className="mb-8">
          <Link to="/admin" className="mb-4 inline-flex items-center font-mono text-xs uppercase tracking-[0.14em] text-seal-ink underline-offset-[3px] hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
          <span className="register block">Admin — Analytics Register</span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Player Analytics</h1>
          <p className="mt-2 text-sm text-ink-soft sm:text-base">Platform metrics and level performance</p>
        </FadeIn>

        <AsyncSection state={dashboard} onRetry={dashboard.reload} skeleton={<AnalyticsStatsSkeleton />}>
          <FadeIn className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" delay="0.1s">
            <StatCard icon={Target} label="Total Users" value={dashboard.data.total_users} />
            <StatCard icon={BarChart3} label="Recent Signups" value={dashboard.data.recent_signups} />
            <StatCard icon={Trophy} label="Completed Sessions" value={dashboard.data.completed_sessions} />
            <StatCard icon={Layers} label="Avg Score" value={dashboard.data.average_score} />
          </FadeIn>
        </AsyncSection>

        <FadeIn className="plate plate-strong mt-8" delay="0.2s">
          <div className="border-b border-hairline px-5 py-4">
            <h2 className="text-lg font-bold tracking-tight text-ink">Level Performance</h2>
          </div>
          <div className="p-5">
            <AsyncSection state={levels} onRetry={levels.reload} skeleton={<LevelPerformanceSkeleton />}>
              {levels.data.length === 0 ? (
                <p className="text-sm text-ink-soft">No level session data yet.</p>
              ) : (
                <div className="space-y-4">
                  {levels.data.map((l) => (
                    <div key={l.level_id} className="flex items-center gap-4">
                      <span className="w-16 font-mono text-xs uppercase tracking-[0.14em] text-ink">Level {l.level_id}</span>
                      <div className="flex-1">
                        <div className="h-3 border border-hairline bg-stock">
                          <div
                            className="h-full bg-ink"
                            style={{ width: `${Math.min(100, (l.average_score || 0))}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-32 text-right font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">{l.sessions} sessions</span>
                    </div>
                  ))}
                </div>
              )}
            </AsyncSection>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function AnalyticsStatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="plate p-4">
          <div className="mb-4 h-10 w-10 bg-ink-soft/20" />
          <div className="space-y-2">
            <div className="h-3 w-24 bg-ink-soft/20" />
            <div className="h-8 w-16 bg-ink-soft/20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function LevelPerformanceSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-4 w-16 bg-ink-soft/20" />
          <div className="h-4 flex-1 bg-ink-soft/20" />
          <div className="h-4 w-20 bg-ink-soft/20" />
        </div>
      ))}
    </div>
  );
}
