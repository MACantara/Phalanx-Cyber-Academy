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
    const res = await api.get('/users/me');
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
    <section className="relative flex min-h-[80vh] items-center justify-center bg-stock px-5 py-12 transition-colors duration-300">
      <FadeIn className="plate w-full max-w-xl p-6 sm:p-8" delay="0.1s">
        <span className="register">Record Amendment</span>
        <h1 className="mb-2 mt-3 text-3xl font-extrabold tracking-tight text-ink">Edit Profile</h1>
        <p className="mb-6 text-ink-soft">Update your account details</p>

        <AsyncSection state={remote} onRetry={remote.reload} skeleton={<EditProfileSkeleton />}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Username" name="username" type="text" value={form.username} onChange={handleChange} />
            <div>
              <label htmlFor="email" className="register block">Email</label>
              <input id="email" name="email" type="email" value={form.email} readOnly disabled className="mt-2 w-full cursor-not-allowed border border-hairline bg-stock-drift px-4 py-3 text-ink-soft" />
              <p className="mt-1 text-xs text-ink-soft">Managed by your sign-in provider</p>
            </div>
            <Field label="Timezone" name="timezone" type="text" value={form.timezone} onChange={handleChange} />
            <div>
              <label htmlFor="cybersecurity_experience" className="register block">Experience Level</label>
              <select id="cybersecurity_experience" name="cybersecurity_experience" value={form.cybersecurity_experience} onChange={handleChange} className="mt-2 w-full border border-hairline bg-stock px-4 py-3 text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-seal-ink">
                {EXPERIENCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={saving}
                className="min-h-[44px] flex-1 bg-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="min-h-[44px] border border-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-stock-green"
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
        <div className="h-4 w-20 bg-hairline-soft" />
        <div className="mt-2 h-12 w-full border border-hairline bg-hairline-soft" />
      </div>
      <div>
        <div className="h-4 w-20 bg-hairline-soft" />
        <div className="mt-2 h-12 w-full border border-hairline bg-hairline-soft" />
      </div>
      <div>
        <div className="h-4 w-20 bg-hairline-soft" />
        <div className="mt-2 h-12 w-full border border-hairline bg-hairline-soft" />
      </div>
      <div>
        <div className="h-4 w-32 bg-hairline-soft" />
        <div className="mt-2 h-12 w-full border border-hairline bg-hairline-soft" />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="h-12 flex-1 bg-hairline-soft" />
        <div className="h-12 w-full bg-hairline-soft sm:w-24" />
      </div>
    </div>
  );
}

function Field({ label, name, type, value, onChange }: { label: string; name: string; type: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void }) {
  return (
    <div>
      <label htmlFor={name} className="register block">{label}</label>
      <input id={name} name={name} type={type} value={value} onChange={onChange} className="mt-2 w-full border border-hairline bg-stock px-4 py-3 text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-seal-ink" />
    </div>
  );
}
