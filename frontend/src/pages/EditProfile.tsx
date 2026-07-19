import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../hooks/useData';
import AsyncSection from '../components/AsyncSection';
import { FadeIn } from '../components/Animated';

interface UserProfile {
  username: string | null;
  email: string;
  timezone: string;
  cybersecurity_experience: string | null;
}

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export default function EditProfile() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { setUser: setContextUser } = useAuth();

  const initial = {
    username: '',
    email: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    cybersecurity_experience: '',
  };

  const remote = useData<UserProfile>(async () => {
    const res = await api.get('/auth/me');
    return res.data.user;
  }, [], { initial });

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (remote.data) {
      setForm({
        username: remote.data.username || '',
        email: remote.data.email || '',
        timezone: remote.data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        cybersecurity_experience: remote.data.cybersecurity_experience || '',
      });
    }
  }, [remote.data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/users/me', form);
      setContextUser(res.data.user);
      showToast('Profile updated successfully!', 'success');
      navigate('/profile');
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="relative flex min-h-[80vh] items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 py-12 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <FadeIn className="relative z-10 w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl dark:border-gray-700 dark:bg-gray-800" delay="0.1s">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-300">Update your account details</p>

        <AsyncSection state={remote} onRetry={remote.reload} skeleton={<EditProfileSkeleton />}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Username" name="username" type="text" value={form.username} onChange={handleChange} />
            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
            <Field label="Timezone" name="timezone" type="text" value={form.timezone} onChange={handleChange} />
            <div>
              <label htmlFor="cybersecurity_experience" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Experience Level</label>
              <select id="cybersecurity_experience" name="cybersecurity_experience" value={form.cybersecurity_experience} onChange={handleChange} className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white">
                {EXPERIENCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </AsyncSection>
      </FadeIn>
    </section>
  );
}

function EditProfileSkeleton() {
  return (
    <div className="space-y-5">
      <div>
        <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-2 h-12 w-full rounded-xl bg-slate-200 dark:bg-slate-700" />
      </div>
      <div>
        <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-2 h-12 w-full rounded-xl bg-slate-200 dark:bg-slate-700" />
      </div>
      <div>
        <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-2 h-12 w-full rounded-xl bg-slate-200 dark:bg-slate-700" />
      </div>
      <div>
        <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-2 h-12 w-full rounded-xl bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="flex gap-3">
        <div className="h-12 flex-1 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="h-12 w-24 rounded-xl bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}

function Field({ label, name, type, value, onChange }: { label: string; name: string; type: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      <input id={name} name={name} type={type} value={value} onChange={onChange} className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white" />
    </div>
  );
}
