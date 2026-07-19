import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useData } from '../hooks/useData';
import AsyncSection from '../components/AsyncSection';
import { FadeIn, Stagger } from '../components/Animated';
import { Users, Mail, Layers, ShieldCheck, Trophy, TrendingUp } from 'lucide-react';

interface AdminStats {
  users: { total: number; active: number; verified: number };
  levels: { total: number; available: number };
  contacts: { unread: number };
}

interface RecentUser {
  id: number;
  username: string | null;
  email: string;
  total_xp: number;
  is_active: boolean;
}

const initialStats: AdminStats = {
  users: { total: 0, active: 0, verified: 0 },
  levels: { total: 0, available: 0 },
  contacts: { unread: 0 },
};

export default function AdminDashboard() {
  const stats = useData<AdminStats>(async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  }, [], { initial: initialStats });

  const recentUsers = useData<RecentUser[]>(async () => {
    const res = await api.get('/users/?per_page=5');
    return res.data.users || [];
  }, [], { initial: [] });

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats.data.users.total },
    { icon: TrendingUp, label: 'Active Users', value: stats.data.users.active },
    { icon: Trophy, label: 'Verified Users', value: stats.data.users.verified },
    { icon: Layers, label: 'Levels', value: stats.data.levels.total },
    { icon: ShieldCheck, label: 'Available Levels', value: stats.data.levels.available },
    { icon: Mail, label: 'Unread Messages', value: stats.data.contacts.unread },
  ];

  return (
    <section className="relative min-h-[80vh] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-12">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-10">
          <h1 className="text-4xl font-bold text-white md:text-5xl">Admin Dashboard</h1>
          <p className="mt-2 text-lg text-slate-300">Platform overview and recent activity</p>
        </FadeIn>

        <AsyncSection state={stats} onRetry={stats.reload} skeleton={<AdminStatsSkeleton />}>
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" baseDelay={0.1} increment={0.1}>
            {statCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 shadow-lg backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    <card.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">{card.label}</p>
                    <p className="text-3xl font-bold text-white">{card.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </Stagger>
        </AsyncSection>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <FadeIn className="lg:col-span-2" delay="0.4s">
            <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 shadow-lg backdrop-blur-md">
              <h2 className="mb-4 text-2xl font-bold text-white">Recent Users</h2>
              <AsyncSection state={recentUsers} onRetry={recentUsers.reload} skeleton={<RecentUsersSkeleton />}>
                {recentUsers.data.length === 0 ? (
                  <p className="text-slate-300">No users found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="border-b border-slate-600 text-slate-200">
                        <tr>
                          <th className="py-2 pr-4">Username</th>
                          <th className="py-2 pr-4">Email</th>
                          <th className="py-2 pr-4">XP</th>
                          <th className="py-2 pr-4">Status</th>
                          <th className="py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {recentUsers.data.map((u) => (
                          <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                            <td className="py-2 pr-4">{u.username || '—'}</td>
                            <td className="py-2 pr-4">{u.email}</td>
                            <td className="py-2 pr-4">{u.total_xp}</td>
                            <td className="py-2 pr-4">{u.is_active ? 'Active' : 'Inactive'}</td>
                            <td className="py-2">
                              <Link to={`/admin/users/${u.id}`} className="text-blue-400 hover:underline">View</Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </AsyncSection>
            </div>
          </FadeIn>

          <FadeIn delay="0.5s">
            <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 shadow-lg backdrop-blur-md">
              <h2 className="mb-4 text-2xl font-bold text-white">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/admin/users"
                  className="block rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white transition-all hover:bg-blue-700"
                >
                  Manage Users
                </Link>
                <Link
                  to="/admin/logs"
                  className="block rounded-xl bg-slate-700 px-4 py-3 text-center font-semibold text-white transition-all hover:bg-slate-600"
                >
                  View Logs
                </Link>
                <Link
                  to="/admin/analytics"
                  className="block rounded-xl bg-slate-700 px-4 py-3 text-center font-semibold text-white transition-all hover:bg-slate-600"
                >
                  Player Analytics
                </Link>
                <Link
                  to="/admin/reports"
                  className="block rounded-xl bg-slate-700 px-4 py-3 text-center font-semibold text-white transition-all hover:bg-slate-600"
                >
                  Reports
                </Link>
                <Link
                  to="/admin/backups"
                  className="block rounded-xl bg-slate-700 px-4 py-3 text-center font-semibold text-white transition-all hover:bg-slate-600"
                >
                  System Backup
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function RecentUsersSkeleton() {
  return (
    <div className="space-y-3 text-sm text-slate-300">
      <div className="flex border-b border-slate-600 pb-2 text-slate-200">
        <div className="h-4 w-28 rounded bg-slate-500/30 py-2 pr-4" />
        <div className="h-4 w-40 rounded bg-slate-500/30 py-2 pr-4" />
        <div className="h-4 w-12 rounded bg-slate-500/30 py-2 pr-4" />
        <div className="h-4 w-16 rounded bg-slate-500/30 py-2 pr-4" />
        <div className="h-4 w-10 rounded bg-slate-500/30 py-2" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex border-b border-slate-700/50 py-2">
          <div className="h-4 w-24 rounded bg-slate-500/30 pr-4" />
          <div className="h-4 w-48 rounded bg-slate-500/30 pr-4" />
          <div className="h-4 w-12 rounded bg-slate-500/30 pr-4" />
          <div className="h-4 w-16 rounded bg-slate-500/30 pr-4" />
          <div className="h-4 w-8 rounded bg-slate-500/30" />
        </div>
      ))}
    </div>
  );
}

function AdminStatsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-slate-500/30" />
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-slate-500/30" />
              <div className="h-8 w-16 rounded bg-slate-500/30" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
