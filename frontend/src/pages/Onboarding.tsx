import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { FadeIn } from '../components/Animated';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Globe, Award } from 'lucide-react';

export default function Onboarding() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: user?.username || '',
    cybersecurity_experience: '',
    timezone: 'UTC',
    onboarding_completed: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.put('/users/me', form);
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-4 py-20">
      <div className="relative z-10 w-full max-w-lg">
        <FadeIn>
          <div className="text-center">
            <Shield className="mx-auto h-14 w-14 text-blue-400" />
            <h1 className="mt-4 text-4xl font-bold text-white">Welcome to Phalanx</h1>
            <p className="mt-2 text-slate-300">Complete your profile to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-slate-700 bg-slate-800/70 p-8 shadow-lg backdrop-blur-md">
            {error && <p className="mb-4 rounded-lg bg-red-100 p-3 text-center text-red-700 dark:bg-red-900/30 dark:text-red-200">{error}</p>}

            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="mb-2 flex items-center text-sm font-semibold text-slate-300">
                  <User className="mr-2 h-4 w-4" /> Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter a username"
                />
              </div>

              <div>
                <label htmlFor="experience" className="mb-2 flex items-center text-sm font-semibold text-slate-300">
                  <Award className="mr-2 h-4 w-4" /> Cybersecurity Experience
                </label>
                <select
                  id="experience"
                  value={form.cybersecurity_experience}
                  onChange={(e) => setForm({ ...form, cybersecurity_experience: e.target.value })}
                  required
                  className="w-full cursor-pointer rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label htmlFor="timezone" className="mb-2 flex items-center text-sm font-semibold text-slate-300">
                  <Globe className="mr-2 h-4 w-4" /> Timezone
                </label>
                <select
                  id="timezone"
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                  className="w-full cursor-pointer rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
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
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Complete Onboarding'}
            </button>
          </form>
        </FadeIn>
      </div>
    </section>
  );
}
