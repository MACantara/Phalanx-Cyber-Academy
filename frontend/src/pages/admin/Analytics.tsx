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
  <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 shadow-lg backdrop-blur-md">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <Icon className="h-6 w-6" />
    </div>
    <p className="text-slate-400">{label}</p>
    <p className="text-3xl font-bold text-white">{value}</p>
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
    <section className="relative min-h-[80vh] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-12">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-8">
          <Link to="/admin" className="mb-4 inline-flex items-center text-slate-300 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-white md:text-5xl">Player Analytics</h1>
          <p className="mt-2 text-lg text-slate-300">Platform metrics and level performance</p>
        </FadeIn>

        <AsyncSection state={dashboard} onRetry={dashboard.reload} skeleton={<AnalyticsStatsSkeleton />}>
          <FadeIn className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" delay="0.1s">
            <StatCard icon={Target} label="Total Users" value={dashboard.data.total_users} />
            <StatCard icon={BarChart3} label="Recent Signups" value={dashboard.data.recent_signups} />
            <StatCard icon={Trophy} label="Completed Sessions" value={dashboard.data.completed_sessions} />
            <StatCard icon={Layers} label="Avg Score" value={dashboard.data.average_score} />
          </FadeIn>
        </AsyncSection>

        <FadeIn className="mt-10 rounded-2xl border border-slate-700 bg-slate-800/70 p-6 shadow-lg backdrop-blur-md" delay="0.2s">
          <h2 className="mb-4 text-2xl font-bold text-white">Level Performance</h2>
          <AsyncSection state={levels} onRetry={levels.reload} skeleton={<LevelPerformanceSkeleton />}>
            {levels.data.length === 0 ? (
              <p className="text-slate-300">No level session data yet.</p>
            ) : (
              <div className="space-y-4">
                {levels.data.map((l) => (
                  <div key={l.level_id} className="flex items-center gap-4">
                    <span className="w-16 text-slate-300">Level {l.level_id}</span>
                    <div className="flex-1">
                      <div className="h-4 rounded bg-slate-700">
                        <div
                          className="h-4 rounded bg-gradient-to-r from-blue-500 to-purple-600"
                          style={{ width: `${Math.min(100, (l.average_score || 0))}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-32 text-right text-slate-300">{l.sessions} sessions</span>
                  </div>
                ))}
              </div>
            )}
          </AsyncSection>
        </FadeIn>
      </div>
    </section>
  );
}

function AnalyticsStatsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 shadow-lg backdrop-blur-md">
          <div className="mb-4 h-12 w-12 rounded-xl bg-slate-500/30" />
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-slate-500/30" />
            <div className="h-8 w-16 rounded bg-slate-500/30" />
          </div>
        </div>
      ))}
    </div>
  );
}

function LevelPerformanceSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 border-b border-slate-600 pb-2">
        <div className="h-4 w-12 rounded bg-slate-500/30" />
        <div className="h-4 flex-1 rounded bg-slate-500/30" />
        <div className="h-4 w-24 rounded bg-slate-500/30" />
      </div>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-4 w-16 rounded bg-slate-500/30" />
          <div className="h-4 flex-1 rounded bg-slate-500/30" />
          <div className="h-4 w-20 rounded bg-slate-500/30" />
        </div>
      ))}
    </div>
  );
}
