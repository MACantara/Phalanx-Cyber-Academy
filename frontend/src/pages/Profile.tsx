import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useData } from '../hooks/useData';
import AsyncSection from '../components/AsyncSection';
import { FadeIn } from '../components/Animated';
import { UserCircle, CheckCircle, XCircle, Mail, Globe, Clock, Calendar, Award, Pencil, type LucideIcon } from 'lucide-react';

interface UserProfile {
  id: number;
  username: string | null;
  email: string;
  is_admin: boolean;
  is_verified: boolean;
  is_active: boolean;
  total_xp: number;
  timezone: string;
  cybersecurity_experience: string | null;
  created_at?: string;
  last_login?: string;
}

export default function Profile() {
  const { setUser: setContextUser } = useAuth();
  const profile = useData<UserProfile | null>(async () => {
    const res = await api.get('/auth/me');
    return res.data.user;
  }, [], { initial: null });

  useEffect(() => {
    if (profile.data) setContextUser(profile.data);
  }, [profile.data, setContextUser]);

  return (
    <section className="min-h-screen bg-gray-50 py-12 transition-colors dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <AsyncSection state={profile} onRetry={profile.reload} skeleton={<ProfileSkeleton />}>
          {profile.data && (
            <FadeIn>
              <div className="overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800">
                <div className="px-6 py-8">
                  <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="mb-4 flex items-center space-x-4 lg:mb-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <UserCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Profile</h1>
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row">
                      <span
                        className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold shadow-md transition-all hover:scale-105 ${
                          profile.data.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {profile.data.is_active ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" /> Active Account
                          </>
                        ) : (
                          <>
                            <XCircle className="mr-2 h-4 w-4" /> Inactive Account
                          </>
                        )}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800 shadow-md transition-all hover:scale-105 dark:bg-blue-900 dark:text-blue-200">
                        <Calendar className="mr-2 h-4 w-4" /> Member since {formatDate(profile.data.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <ProfileField label="Username" icon={UserCircle} value={profile.data.username || 'N/A'} />
                    <ProfileField label="Email Address" icon={Mail} value={profile.data.email} />
                    <ProfileField label="Timezone" icon={Globe} value={profile.data.timezone || 'UTC'} />
                    <ProfileField label="Member Since" icon={Calendar} value={formatDate(profile.data.created_at)} />
                    <ProfileField label="Experience Level" icon={Award} value={profile.data.cybersecurity_experience || 'Not set'} />
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>
                      Last login:{' '}
                      {profile.data.last_login ? formatDateTime(profile.data.last_login) : 'First time login'}
                    </span>
                  </div>
                  <Link
                    to="/profile/edit"
                    className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:scale-105"
                  >
                    <Pencil className="mr-1 h-4 w-4" /> Edit Profile
                  </Link>
                </div>
              </div>
            </FadeIn>
          )}
        </AsyncSection>
      </div>
    </section>
  );
}

function ProfileSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800">
      <div className="px-6 py-8">
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 flex items-center space-x-4 lg:mb-0">
            <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="h-8 w-48 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="h-8 w-32 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="h-8 w-36 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-12 w-full rounded-xl bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-10 w-32 rounded-lg bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}

function ProfileField({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      <div className="flex items-center overflow-hidden rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 transition-all hover:bg-gray-100 hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
        <Icon className="mr-2 h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
        <span className="truncate">{value}</span>
      </div>
    </div>
  );
}

function formatDate(value?: string): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatDateTime(value?: string): string {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
