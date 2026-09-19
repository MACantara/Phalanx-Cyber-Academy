import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { FadeIn } from '../components/Animated';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Globe, Award } from 'lucide-react';

export default function Onboarding() {
  const { user, setUser, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: user?.username || '',
    cybersecurity_experience: '',
    timezone: 'UTC',
    onboarding_completed: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [usernameTaken, setUsernameTaken] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) navigate('/login');
      else if (user.onboarding_completed) navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const username = form.username.trim();
    if (!username || username === user?.username) {
      setUsernameTaken(false);
      setUsernameAvailable(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.post('/auth/check-availability', { field: 'username', value: username });
        setUsernameTaken(!res.data.available);
        setUsernameAvailable(res.data.available);
      } catch {
        setUsernameTaken(false);
        setUsernameAvailable(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [form.username, user?.username]);

  if (loading || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await api.put('/users/me', form);
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = 'w-full border border-hairline bg-stock px-4 py-3 text-ink placeholder:text-ink-soft focus:outline-2 focus:outline-seal-ink';

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stock px-5 py-14 sm:px-8 sm:py-20">
      <div className="dotfield absolute inset-0" aria-hidden="true" />
      <span className="absolute left-4 top-4 font-mono text-ink opacity-50 sm:left-6 sm:top-6" aria-hidden="true">+</span>
      <span className="absolute right-4 top-4 font-mono text-ink opacity-50 sm:right-6 sm:top-6" aria-hidden="true">+</span>
      <span className="absolute bottom-4 left-4 font-mono text-ink opacity-50 sm:bottom-6 sm:left-6" aria-hidden="true">+</span>
      <span className="absolute bottom-4 right-4 font-mono text-ink opacity-50 sm:bottom-6 sm:right-6" aria-hidden="true">+</span>

      <div className="relative z-10 w-full max-w-md">
        <FadeIn>
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center bg-seal text-seal-ink">
              <Shield className="h-7 w-7" />
            </div>
            <span className="register">Recruit Intake — Profile Register</span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Welcome to Phalanx</h1>
            <p className="mt-2 text-ink-soft">Complete your profile to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="plate reg-corners mt-8 p-6 sm:p-8">
            {error && (
              <p className="mb-5 border border-strike/50 px-4 py-3 font-mono text-xs text-strike">✗ {error}</p>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="username" className="register mb-2 flex items-center">
                  <User className="mr-2 h-4 w-4" /> Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                  className={`${fieldClass} ${usernameTaken ? 'border-strike' : ''}`}
                  placeholder="Enter a username"
                />
                {usernameTaken ? (
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-strike">✗ Username is already taken</p>
                ) : usernameAvailable ? (
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-confirm">✓ Username available</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="experience" className="register mb-2 flex items-center">
                  <Award className="mr-2 h-4 w-4" /> Cybersecurity Experience
                </label>
                <select
                  id="experience"
                  value={form.cybersecurity_experience}
                  onChange={(e) => setForm({ ...form, cybersecurity_experience: e.target.value })}
                  required
                  className={`${fieldClass} cursor-pointer`}
                >
                  <option value="">Select level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label htmlFor="timezone" className="register mb-2 flex items-center">
                  <Globe className="mr-2 h-4 w-4" /> Timezone
                </label>
                <select
                  id="timezone"
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                  className={`${fieldClass} cursor-pointer`}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Asia/Singapore">Singapore</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || usernameTaken}
              className="mt-7 inline-flex min-h-[44px] w-full items-center justify-center bg-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink hover:text-stock disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-seal dark:hover:text-seal-ink"
            >
              {saving ? 'Saving...' : 'Complete Onboarding'}
            </button>
          </form>
        </FadeIn>
      </div>
    </section>
  );
}
