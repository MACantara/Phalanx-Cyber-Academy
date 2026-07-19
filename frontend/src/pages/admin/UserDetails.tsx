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
    <section className="relative min-h-[80vh] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-12">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Link to="/admin/users" className="rounded-xl bg-slate-700 p-2 text-white transition-all hover:bg-slate-600">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-white md:text-5xl">User Details</h1>
              <p className="text-slate-300">Review account information and activity</p>
            </div>
          </div>
          {userData && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleAction('toggle_active')}
                className="inline-flex items-center rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-600"
              >
                <Power className="mr-2 h-4 w-4" /> {userData.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => handleAction('toggle_admin')}
                className="inline-flex items-center rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-600"
              >
                <UserCog className="mr-2 h-4 w-4" /> {userData.is_admin ? 'Revoke Admin' : 'Make Admin'}
              </button>
              <button
                onClick={() => handleAction('delete')}
                className="inline-flex items-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </button>
              <div className="flex items-center gap-2 rounded-xl bg-slate-700 p-1">
                <input
                  type="number"
                  min={1}
                  value={grantAmount}
                  onChange={(e) => setGrantAmount(e.target.value)}
                  placeholder="XP"
                  className="w-20 rounded-lg border border-slate-600 bg-slate-900 px-2 py-1.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={handleGrantXp}
                  className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition-all hover:bg-blue-500"
                >
                  <Award className="mr-1.5 h-4 w-4" /> Grant
                </button>
              </div>
            </div>
          )}
        </FadeIn>

        {actionError && <p className="mb-6 rounded-lg bg-red-100 p-4 text-center text-red-700 dark:bg-red-900/30 dark:text-red-200">{actionError}</p>}

        <AsyncSection state={user} onRetry={user.reload} skeleton={<UserDetailsOverviewSkeleton />}>
          {userData && (
            <FadeIn delay="0.1s">
              <div className="grid gap-8 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 shadow-lg backdrop-blur-md">
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-bold text-white">
                    {(userData.username?.[0] || userData.email[0]).toUpperCase()}
                  </div>
                  <h2 className="text-center text-2xl font-bold text-white">{userData.username || 'Unnamed User'}</h2>
                  <p className="text-center text-slate-400">{userData.email}</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {userData.is_admin && <span className="rounded-full bg-purple-500/20 px-3 py-1 text-sm text-purple-200">Admin</span>}
                    {userData.is_verified && <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm text-green-200">Verified</span>}
                    <span className={`rounded-full px-3 py-1 text-sm ${userData.is_active ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
                      {userData.is_active ? 'Active' : 'Inactive'}
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
                          className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                            tab === t.id
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          <Icon className="mr-2 h-4 w-4" /> {t.label}
                        </button>
                      );
                    })}
                  </div>

                  {tab === 'overview' && (
                    <div className="space-y-4">
                      <DetailItem icon={User} label="Username" value={userData.username || '—'} />
                      <DetailItem icon={Mail} label="Email" value={userData.email} />
                      <DetailItem icon={Award} label="Total XP" value={String(userData.total_xp)} />
                      <DetailItem icon={Shield} label="Experience Level" value={userData.cybersecurity_experience || '—'} />
                      <DetailItem icon={Calendar} label="Joined" value={formatDate(userData.created_at)} />
                      <DetailItem icon={Calendar} label="Last Login" value={formatDate(userData.last_login)} />
                    </div>
                  )}

                  {tab === 'activity' && (
                    <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/70 shadow-lg backdrop-blur-md">
                      <AsyncSection state={activity} onRetry={activity.reload} skeleton={<ActivityTableSkeleton />}>
                        <table className="w-full text-left text-sm text-slate-300">
                          <thead className="border-b border-slate-600 bg-slate-700/50 text-slate-200">
                            <tr>
                              <th className="px-4 py-3">Session</th>
                              <th className="px-4 py-3">Level</th>
                              <th className="px-4 py-3">Score</th>
                              <th className="px-4 py-3">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activity.data.sessions.length === 0 ? (
                              <tr><td colSpan={4} className="px-4 py-6 text-center">No sessions found.</td></tr>
                            ) : (
                              activity.data.sessions.map((s) => (
                                <tr key={s.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                  <td className="px-4 py-3">{s.session_name}</td>
                                  <td className="px-4 py-3">{s.level_id ?? '—'}</td>
                                  <td className="px-4 py-3">{s.score ?? '—'}</td>
                                  <td className="px-4 py-3">{s.end_time ? 'Completed' : 'Active'}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </AsyncSection>
                    </div>
                  )}

                  {tab === 'login' && (
                    <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/70 shadow-lg backdrop-blur-md">
                      <AsyncSection state={activity} onRetry={activity.reload} skeleton={<ActivityTableSkeleton />}>
                        <table className="w-full text-left text-sm text-slate-300">
                          <thead className="border-b border-slate-600 bg-slate-700/50 text-slate-200">
                            <tr>
                              <th className="px-4 py-3">IP Address</th>
                              <th className="px-4 py-3">Identifier</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activity.data.login_attempts.length === 0 ? (
                              <tr><td colSpan={4} className="px-4 py-6 text-center">No login attempts.</td></tr>
                            ) : (
                              activity.data.login_attempts.map((a) => (
                                <tr key={a.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                  <td className="px-4 py-3">{a.ip_address}</td>
                                  <td className="px-4 py-3">{a.username_or_email || '—'}</td>
                                  <td className={`px-4 py-3 ${a.success ? 'text-green-300' : 'text-red-300'}`}>{a.success ? 'Success' : 'Failed'}</td>
                                  <td className="px-4 py-3">{formatDate(a.attempted_at)}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </AsyncSection>
                    </div>
                  )}

                  {tab === 'verification' && (
                    <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/70 shadow-lg backdrop-blur-md">
                      <AsyncSection state={activity} onRetry={activity.reload} skeleton={<ActivityTableSkeleton />}>
                        <table className="w-full text-left text-sm text-slate-300">
                          <thead className="border-b border-slate-600 bg-slate-700/50 text-slate-200">
                            <tr>
                              <th className="px-4 py-3">Email</th>
                              <th className="px-4 py-3">Type</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Created</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activity.data.email_verifications.length === 0 ? (
                              <tr><td colSpan={4} className="px-4 py-6 text-center">No verifications.</td></tr>
                            ) : (
                              activity.data.email_verifications.map((v) => (
                                <tr key={v.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                  <td className="px-4 py-3">{v.email}</td>
                                  <td className="px-4 py-3 capitalize">{v.code_type}</td>
                                  <td className={`px-4 py-3 ${v.verified_at ? 'text-green-300' : 'text-yellow-300'}`}>{v.verified_at ? 'Verified' : 'Pending'}</td>
                                  <td className="px-4 py-3">{formatDate(v.created_at)}</td>
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
    <div className="grid gap-8 lg:grid-cols-4">
      <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 shadow-lg backdrop-blur-md">
        <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-slate-500/30" />
        <div className="mx-auto mb-2 h-6 w-40 rounded bg-slate-500/30" />
        <div className="mx-auto mb-4 h-4 w-56 rounded bg-slate-500/30" />
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <div className="h-6 w-16 rounded-full bg-slate-500/30" />
          <div className="h-6 w-20 rounded-full bg-slate-500/30" />
        </div>
      </div>

      <div className="lg:col-span-3">
        <div className="mb-4 flex flex-wrap gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-9 w-28 rounded-xl bg-slate-500/30" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center rounded-2xl border border-slate-700 bg-slate-800/70 p-4 shadow-md backdrop-blur-sm">
              <div className="mr-4 h-10 w-10 rounded-full bg-slate-500/30" />
              <div className="w-full space-y-2">
                <div className="h-4 w-24 rounded bg-slate-500/30" />
                <div className="h-5 w-40 rounded bg-slate-500/30" />
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
    <table className="w-full text-left text-sm text-slate-300">
      <thead className="border-b border-slate-600 bg-slate-700/50 text-slate-200">
        <tr>
          <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-slate-500/30" /></td>
          <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-slate-500/30" /></td>
          <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-slate-500/30" /></td>
          <td className="px-4 py-3"><div className="h-4 w-28 rounded bg-slate-500/30" /></td>
        </tr>
      </thead>
      <tbody>
        {[...Array(4)].map((_, i) => (
          <tr key={i} className="border-b border-slate-700/50">
            <td className="px-4 py-3"><div className="h-4 w-28 rounded bg-slate-500/30" /></td>
            <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-slate-500/30" /></td>
            <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-slate-500/30" /></td>
            <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-slate-500/30" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center rounded-2xl border border-slate-700 bg-slate-800/70 p-4 shadow-md backdrop-blur-sm">
      <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-slate-300">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="text-lg font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}
