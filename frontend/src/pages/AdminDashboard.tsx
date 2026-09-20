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
    <section className="min-h-[80vh] bg-stock py-12">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <FadeIn className="mb-10">
          <span className="register">Admin — Operate</span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-ink-soft sm:text-base">Platform overview and recent activity</p>
        </FadeIn>

        <AsyncSection state={stats} onRetry={stats.reload} skeleton={<AdminStatsSkeleton />}>
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" baseDelay={0.1} increment={0.1}>
            {statCards.map((card) => (
              <div
                key={card.label}
                className="plate p-4 transition-colors hover:border-ink"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center bg-seal text-seal-ink">
                  <card.icon className="h-5 w-5" />
                </div>
                <p className="register">{card.label}</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-ink">{card.value}</p>
              </div>
            ))}
          </Stagger>
        </AsyncSection>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <FadeIn className="lg:col-span-2" delay="0.4s">
            <div className="plate plate-strong">
              <div className="border-b border-hairline px-5 py-4">
                <h2 className="text-lg font-bold tracking-tight text-ink">Recent Users</h2>
              </div>
              <AsyncSection state={recentUsers} onRetry={recentUsers.reload} skeleton={<RecentUsersSkeleton />}>
                {recentUsers.data.length === 0 ? (
                  <p className="px-5 py-6 text-sm text-ink-soft">No users found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-stock text-left text-sm text-ink">
                      <thead className="bg-stock-drift font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                        <tr>
                          <th className="px-4 py-3 font-normal">Username</th>
                          <th className="px-4 py-3 font-normal">Email</th>
                          <th className="px-4 py-3 font-normal">XP</th>
                          <th className="px-4 py-3 font-normal">Status</th>
                          <th className="px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-hairline">
                        {recentUsers.data.map((u) => (
                          <tr key={u.id} className="transition-colors hover:bg-stock-green">
                            <td className="px-4 py-3">{u.username || '—'}</td>
                            <td className="px-4 py-3">{u.email}</td>
                            <td className="px-4 py-3 font-mono text-xs">{u.total_xp}</td>
                            <td className="px-4 py-3">
                              <span className={`font-mono text-[10px] uppercase tracking-[0.16em] ${u.is_active ? 'text-confirm' : 'text-strike'}`}>
                                {u.is_active ? '✓ Active' : '✗ Inactive'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Link to={`/admin/users/${u.id}`} className="font-mono text-xs uppercase tracking-[0.14em] text-seal-ink underline-offset-[3px] hover:underline">View</Link>
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
            <div className="plate p-5">
              <span className="register">Operations</span>
              <h2 className="mb-4 mt-1 text-lg font-bold tracking-tight text-ink">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/admin/users"
                  className="flex min-h-[44px] items-center justify-center bg-ink px-4 py-3 text-center font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink hover:text-stock dark:hover:bg-seal dark:hover:text-seal-ink"
                >
                  Manage Users
                </Link>
                <Link
                  to="/admin/logs"
                  className="flex min-h-[44px] items-center justify-center border border-hairline bg-stock px-4 py-3 text-center font-mono text-xs uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink hover:bg-stock-green"
                >
                  View Logs
                </Link>
                <Link
                  to="/admin/analytics"
                  className="flex min-h-[44px] items-center justify-center border border-hairline bg-stock px-4 py-3 text-center font-mono text-xs uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink hover:bg-stock-green"
                >
                  Player Analytics
                </Link>
                <Link
                  to="/admin/content"
                  className="flex min-h-[44px] items-center justify-center border border-hairline bg-stock px-4 py-3 text-center font-mono text-xs uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink hover:bg-stock-green"
                >
                  Content Library
                </Link>
                <Link
                  to="/admin/level-content"
                  className="flex min-h-[44px] items-center justify-center border border-hairline bg-stock px-4 py-3 text-center font-mono text-xs uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink hover:bg-stock-green"
                >
                  Level Content
                </Link>
                <Link
                  to="/admin/reports"
                  className="flex min-h-[44px] items-center justify-center border border-hairline bg-stock px-4 py-3 text-center font-mono text-xs uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink hover:bg-stock-green"
                >
                  Reports
                </Link>
                <Link
                  to="/admin/backups"
                  className="flex min-h-[44px] items-center justify-center border border-hairline bg-stock px-4 py-3 text-center font-mono text-xs uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink hover:bg-stock-green"
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
    <div className="space-y-3 px-5 py-5">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 border-b border-hairline-soft pb-3 last:border-b-0 last:pb-0">
          <div className="h-4 w-24 bg-ink-soft/20" />
          <div className="h-4 w-48 bg-ink-soft/20" />
          <div className="h-4 w-12 bg-ink-soft/20" />
          <div className="h-4 w-16 bg-ink-soft/20" />
          <div className="h-4 w-8 bg-ink-soft/20" />
        </div>
      ))}
    </div>
  );
}

function AdminStatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
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
