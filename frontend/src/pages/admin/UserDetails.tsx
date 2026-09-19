import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { useData } from '../../hooks/useData';
import AsyncSection from '../../components/AsyncSection';
import { FadeIn } from '../../components/Animated';
import { ArrowLeft, Mail, Shield, Award, Calendar, User, Activity, LogIn, CheckCircle, Trash2, UserCog, Power } from 'lucide-react';

interface UserProfile {
  id: number;
  username: string | null;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  is_verified: boolean;
  total_xp: number;
  timezone: string;
  cybersecurity_experience: string | null;
  onboarding_completed: boolean;
  created_at?: string;
  last_login?: string;
}

interface SessionRecord {
  id: number;
  session_name: string;
  level_id?: number;
  score?: number;
  start_time?: string;
  end_time?: string;
}

interface LoginAttemptRecord {
  id: number;
  ip_address: string;
  username_or_email?: string;
  success: boolean;
  attempted_at: string;
  user_agent?: string;
}

interface EmailVerificationRecord {
  id: number;
  email: string;
  code_type: string;
  created_at: string;
  expires_at: string;
  verified_at?: string;
}

interface ActivityData {
  sessions: SessionRecord[];
  login_attempts: LoginAttemptRecord[];
  email_verifications: EmailVerificationRecord[];
}

const initialActivity: ActivityData = { sessions: [], login_attempts: [], email_verifications: [] };

export default function UserDetails() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'overview' | 'activity' | 'login' | 'verification'>('overview');
  const [actionError, setActionError] = useState<string | null>(null);
  const [grantAmount, setGrantAmount] = useState('');

  const user = useData<UserProfile | null>(async () => {
    const res = await api.get(`/users/${userId}`);
    return res.data.user;
  }, [userId], { initial: null });

  const activity = useData<ActivityData>(async () => {
    const res = await api.get(`/admin/users/${userId}/activity`);
    return res.data;
  }, [userId], { initial: initialActivity });

  const handleAction = async (action: string) => {
    const id = Number(userId);
    if (Number.isNaN(id)) return;
    try {
      setActionError(null);
      await api.put(`/admin/users/${id}/actions`, { action });
      if (action === 'delete') {
        navigate('/admin/users');
      } else {
        user.reload();
        activity.reload();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.detail || err.message);
    }
  };

  const handleGrantXp = async () => {
    const id = Number(userId);
    if (Number.isNaN(id)) return;
    const amount = Number(grantAmount);
    if (!amount || amount <= 0) {
      setActionError('Enter a positive XP amount');
      return;
    }
    try {
      setActionError(null);
      await api.post(`/admin/users/${id}/xp`, { amount });
      setGrantAmount('');
      user.reload();
    } catch (err: any) {
      setActionError(err.response?.data?.detail || err.message);
    }
  };

  const formatDate = (value?: string) => (value ? new Date(value).toLocaleString() : '—');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'activity', label: 'Sessions', icon: Activity },
    { id: 'login', label: 'Login Attempts', icon: LogIn },
    { id: 'verification', label: 'Verifications', icon: CheckCircle },
  ] as const;

  const userData = user.data;

  return (
    <section className="min-h-[80vh] bg-stock py-12">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <FadeIn className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <Link to="/admin/users" className="border border-hairline bg-stock p-2 text-ink transition-colors hover:border-ink hover:bg-stock-green" aria-label="Back to users">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <span className="register">Admin — Account Dossier</span>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">User Details</h1>
              <p className="mt-1 text-sm text-ink-soft">Review account information and activity</p>
            </div>
          </div>
          {userData && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleAction('toggle_active')}
                className={`inline-flex min-h-[44px] items-center border px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] transition-colors ${userData.is_active ? 'border-strike text-strike hover:bg-strike/10' : 'border-confirm text-confirm hover:bg-confirm/10'}`}
              >
                <Power className="mr-2 h-4 w-4" /> {userData.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => handleAction('toggle_admin')}
                className="inline-flex min-h-[44px] items-center border border-hairline bg-stock px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink hover:bg-stock-green"
              >
                <UserCog className="mr-2 h-4 w-4" /> {userData.is_admin ? 'Revoke Admin' : 'Make Admin'}
              </button>
              <button
                onClick={() => handleAction('delete')}
                className="inline-flex min-h-[44px] items-center border border-strike px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-strike transition-colors hover:bg-strike/10"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </button>
              <div className="flex items-center gap-2 border border-hairline bg-stock p-1.5">
                <input
                  type="number"
                  min={1}
                  value={grantAmount}
                  onChange={(e) => setGrantAmount(e.target.value)}
                  placeholder="XP"
                  className="w-20 border border-hairline bg-stock px-2 py-1.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-seal-ink focus:outline-none focus:ring-2 focus:ring-seal-ink/40"
                />
                <button
                  onClick={handleGrantXp}
                  className="inline-flex items-center bg-ink px-3 py-1.5 font-mono text-xs uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink hover:text-stock dark:hover:bg-seal dark:hover:text-seal-ink"
                >
                  <Award className="mr-1.5 h-4 w-4" /> Grant
                </button>
              </div>
            </div>
          )}
        </FadeIn>

        {actionError && <p className="mb-6 border border-strike/60 bg-stock px-4 py-3 font-mono text-sm text-strike">{actionError}</p>}

        <AsyncSection state={user} onRetry={user.reload} skeleton={<UserDetailsOverviewSkeleton />}>
          {userData && (
            <FadeIn delay="0.1s">
              <div className="grid gap-6 lg:grid-cols-4">
                <div className="plate p-6 text-center">
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center bg-seal text-3xl font-bold text-seal-ink">
                    {(userData.username?.[0] || userData.email[0]).toUpperCase()}
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-ink">{userData.username || 'Unnamed User'}</h2>
                  <p className="mt-1 break-all text-sm text-ink-soft">{userData.email}</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
                    {userData.is_admin && <span className="plate-id">Admin</span>}
                    {userData.is_verified && <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-confirm">✓ Verified</span>}
                    <span className={`font-mono text-[10px] uppercase tracking-[0.16em] ${userData.is_active ? 'text-confirm' : 'text-strike'}`}>
                      {userData.is_active ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {tabs.map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setTab(t.id)}
                          className={`inline-flex min-h-[44px] items-center px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] transition-colors ${
                            tab === t.id
                              ? 'bg-ink text-stock'
                              : 'border border-hairline bg-stock text-ink-soft hover:border-ink hover:text-ink'
                          }`}
                        >
                          <Icon className="mr-2 h-4 w-4" /> {t.label}
                        </button>
                      );
                    })}
                  </div>

                  {tab === 'overview' && (
                    <div className="space-y-3">
                      <DetailItem icon={User} label="Username" value={userData.username || '—'} />
                      <DetailItem icon={Mail} label="Email" value={userData.email} />
                      <DetailItem icon={Award} label="Total XP" value={String(userData.total_xp)} />
                      <DetailItem icon={Shield} label="Experience Level" value={userData.cybersecurity_experience || '—'} />
                      <DetailItem icon={Calendar} label="Joined" value={formatDate(userData.created_at)} />
                      <DetailItem icon={Calendar} label="Last Login" value={formatDate(userData.last_login)} />
                    </div>
                  )}

                  {tab === 'activity' && (
                    <div className="overflow-x-auto">
                      <AsyncSection state={activity} onRetry={activity.reload} skeleton={<ActivityTableSkeleton />}>
                        <table className="min-w-full border border-ink bg-stock text-left text-sm text-ink">
                          <thead className="bg-stock-drift font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                            <tr>
                              <th className="px-4 py-3 font-normal">Session</th>
                              <th className="px-4 py-3 font-normal">Level</th>
                              <th className="px-4 py-3 font-normal">Score</th>
                              <th className="px-4 py-3 font-normal">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-hairline">
                            {activity.data.sessions.length === 0 ? (
                              <tr><td colSpan={4} className="px-4 py-6 text-center text-ink-soft">No sessions found.</td></tr>
                            ) : (
                              activity.data.sessions.map((s) => (
                                <tr key={s.id} className="transition-colors hover:bg-stock-green">
                                  <td className="px-4 py-3">{s.session_name}</td>
                                  <td className="px-4 py-3 font-mono text-xs">{s.level_id ?? '—'}</td>
                                  <td className="px-4 py-3 font-mono text-xs">{s.score ?? '—'}</td>
                                  <td className="px-4 py-3">
                                    <span className={`font-mono text-[10px] uppercase tracking-[0.16em] ${s.end_time ? 'text-confirm' : 'text-ink-soft'}`}>
                                      {s.end_time ? '✓ Completed' : 'Active'}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </AsyncSection>
                    </div>
                  )}

                  {tab === 'login' && (
                    <div className="overflow-x-auto">
                      <AsyncSection state={activity} onRetry={activity.reload} skeleton={<ActivityTableSkeleton />}>
                        <table className="min-w-full border border-ink bg-stock text-left text-sm text-ink">
                          <thead className="bg-stock-drift font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                            <tr>
                              <th className="px-4 py-3 font-normal">IP Address</th>
                              <th className="px-4 py-3 font-normal">Identifier</th>
                              <th className="px-4 py-3 font-normal">Status</th>
                              <th className="px-4 py-3 font-normal">Time</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-hairline">
                            {activity.data.login_attempts.length === 0 ? (
                              <tr><td colSpan={4} className="px-4 py-6 text-center text-ink-soft">No login attempts.</td></tr>
                            ) : (
                              activity.data.login_attempts.map((a) => (
                                <tr key={a.id} className="transition-colors hover:bg-stock-green">
                                  <td className="px-4 py-3 font-mono text-xs">{a.ip_address}</td>
                                  <td className="px-4 py-3">{a.username_or_email || '—'}</td>
                                  <td className="px-4 py-3">
                                    <span className={`font-mono text-[10px] uppercase tracking-[0.16em] ${a.success ? 'text-confirm' : 'text-strike'}`}>
                                      {a.success ? '✓ Success' : '✗ Failed'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">{formatDate(a.attempted_at)}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </AsyncSection>
                    </div>
                  )}

                  {tab === 'verification' && (
                    <div className="overflow-x-auto">
                      <AsyncSection state={activity} onRetry={activity.reload} skeleton={<ActivityTableSkeleton />}>
                        <table className="min-w-full border border-ink bg-stock text-left text-sm text-ink">
                          <thead className="bg-stock-drift font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                            <tr>
                              <th className="px-4 py-3 font-normal">Email</th>
                              <th className="px-4 py-3 font-normal">Type</th>
                              <th className="px-4 py-3 font-normal">Status</th>
                              <th className="px-4 py-3 font-normal">Created</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-hairline">
                            {activity.data.email_verifications.length === 0 ? (
                              <tr><td colSpan={4} className="px-4 py-6 text-center text-ink-soft">No verifications.</td></tr>
                            ) : (
                              activity.data.email_verifications.map((v) => (
                                <tr key={v.id} className="transition-colors hover:bg-stock-green">
                                  <td className="px-4 py-3">{v.email}</td>
                                  <td className="px-4 py-3 font-mono text-xs uppercase">{v.code_type}</td>
                                  <td className="px-4 py-3">
                                    <span className={`font-mono text-[10px] uppercase tracking-[0.16em] ${v.verified_at ? 'text-confirm' : 'text-ink-soft'}`}>
                                      {v.verified_at ? '✓ Verified' : 'Pending'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">{formatDate(v.created_at)}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </AsyncSection>
                    </div>
                  )}
                </div>
              </div>
            </FadeIn>
          )}
        </AsyncSection>
      </div>
    </section>
  );
}

function UserDetailsOverviewSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <div className="plate p-6">
        <div className="mx-auto mb-4 h-24 w-24 bg-ink-soft/20" />
        <div className="mx-auto mb-2 h-6 w-40 bg-ink-soft/20" />
        <div className="mx-auto mb-4 h-4 w-56 bg-ink-soft/20" />
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <div className="h-5 w-16 bg-ink-soft/20" />
          <div className="h-5 w-20 bg-ink-soft/20" />
        </div>
      </div>

      <div className="lg:col-span-3">
        <div className="mb-4 flex flex-wrap gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-11 w-28 bg-ink-soft/20" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="plate flex items-center p-4">
              <div className="mr-4 h-10 w-10 bg-ink-soft/20" />
              <div className="w-full space-y-2">
                <div className="h-3 w-24 bg-ink-soft/20" />
                <div className="h-5 w-40 bg-ink-soft/20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActivityTableSkeleton() {
  return (
    <table className="min-w-full border border-ink bg-stock text-left text-sm text-ink">
      <thead className="bg-stock-drift font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
        <tr>
          <td className="px-4 py-3"><div className="h-3 w-24 bg-ink-soft/20" /></td>
          <td className="px-4 py-3"><div className="h-3 w-24 bg-ink-soft/20" /></td>
          <td className="px-4 py-3"><div className="h-3 w-16 bg-ink-soft/20" /></td>
          <td className="px-4 py-3"><div className="h-3 w-28 bg-ink-soft/20" /></td>
        </tr>
      </thead>
      <tbody className="divide-y divide-hairline">
        {[...Array(4)].map((_, i) => (
          <tr key={i}>
            <td className="px-4 py-3"><div className="h-4 w-28 bg-ink-soft/20" /></td>
            <td className="px-4 py-3"><div className="h-4 w-24 bg-ink-soft/20" /></td>
            <td className="px-4 py-3"><div className="h-4 w-16 bg-ink-soft/20" /></td>
            <td className="px-4 py-3"><div className="h-4 w-24 bg-ink-soft/20" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="plate flex items-center gap-4 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-hairline text-ink">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="register">{label}</p>
        <p className="mt-0.5 break-all text-base font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}
