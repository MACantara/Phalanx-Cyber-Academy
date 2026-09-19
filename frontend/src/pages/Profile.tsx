import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useData } from '../hooks/useData';
import AsyncSection from '../components/AsyncSection';
import { FadeIn } from '../components/Animated';
import { UserCircle, CheckCircle, XCircle, Mail, Globe, Clock, Calendar, Award, Trophy, Pencil, type LucideIcon } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string | null;
  email: string;
  is_admin: boolean;
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
    const res = await api.get('/users/me');
    return res.data.user;
  }, [], { initial: null });

  useEffect(() => {
    if (profile.data) setContextUser(profile.data);
  }, [profile.data, setContextUser]);

  return (
    <section className="min-h-screen bg-stock py-12 transition-colors duration-300">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <AsyncSection state={profile} onRetry={profile.reload} skeleton={<ProfileSkeleton />}>
          {profile.data && (
            <FadeIn>
              <div className="plate reg-corners">
                <div className="px-5 py-8 sm:px-8">
                  <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-seal text-seal-ink">
                        <UserCircle className="h-7 w-7" />
                      </div>
                      <div>
                        <span className="plate-id">USR-{profile.data.id.slice(0, 6).toUpperCase()}</span>
                        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">User Profile</h1>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <span
                        className={`inline-flex min-h-[44px] items-center border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] ${
                          profile.data.is_active
                            ? 'border-confirm text-confirm'
                            : 'border-strike text-strike'
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
                      <span className="inline-flex min-h-[44px] items-center border border-hairline px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
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
                    <ProfileField label="Marks Record" icon={Trophy} value={`MARKS ${profile.data.total_xp}`} />
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-hairline bg-stock-drift px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-8">
                  <div className="flex items-center text-sm text-ink-soft">
                    <Clock className="mr-1 h-4 w-4" />
                    <span className="register">
                      Last login:{' '}
                      {profile.data.last_login ? formatDateTime(profile.data.last_login) : 'First time login'}
                    </span>
                  </div>
                  <Link
                    to="/profile/edit"
                    className="inline-flex min-h-[44px] items-center bg-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink"
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Edit Profile
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
    <div className="plate">
      <div className="px-5 py-8 sm:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 rounded-full bg-hairline-soft" />
            <div className="space-y-2">
              <div className="h-4 w-20 bg-hairline-soft" />
              <div className="h-8 w-48 bg-hairline-soft" />
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="h-11 w-36 border border-hairline bg-hairline-soft" />
            <div className="h-11 w-44 border border-hairline bg-hairline-soft" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-hairline-soft" />
              <div className="h-12 w-full border border-hairline bg-hairline-soft" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-hairline bg-stock-drift px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-8">
        <div className="h-4 w-48 bg-hairline-soft" />
        <div className="h-11 w-32 bg-hairline-soft" />
      </div>
    </div>
  );
}

function ProfileField({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div>
      <label className="register mb-2 block">{label}</label>
      <div className="flex items-center overflow-hidden border border-hairline bg-stock px-4 py-3 text-ink transition-colors hover:bg-stock-green">
        <Icon className="mr-2 h-5 w-5 flex-shrink-0 text-ink-soft" />
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
