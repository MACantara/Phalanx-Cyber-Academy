import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, ArrowLeft } from 'lucide-react';
import { FadeIn } from '../components/Animated';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

const EXPERIENCE_OPTIONS = [
  { value: '', label: 'Select experience level' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export default function Signup() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    email: '',
    username: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    cybersecurity_experience: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/signup', form);
      showToast('Verification code sent to your email.', 'success');
      navigate('/verify', { state: { type: 'signup', email: form.email, signupData: form } });
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to create account', 'error');
      setLoading(false);
    }
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 px-4 py-12 transition-colors dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-pulse rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 animate-pulse rounded-full bg-purple-400/20 blur-3xl" style={{ animationDelay: '1s' }} />
      </div>

      <FadeIn className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl dark:border-gray-700 dark:bg-gray-800" delay="0.1s">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
            <User className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sign Up</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Create a free account and start training</p>
        </div>

        <form onSubmit={handleRequestCode} className="space-y-4">
            <Field
              label="Username"
              id="username"
              name="username"
              type="text"
              icon={User}
              value={form.username}
              onChange={handleChange}
              placeholder="cyber_recruit"
            />
            <Field
              label="Email Address"
              id="email"
              name="email"
              type="email"
              icon={Mail}
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
            <SelectField
              label="Experience Level"
              id="cybersecurity_experience"
              name="cybersecurity_experience"
              value={form.cybersecurity_experience}
              onChange={handleChange}
            />
            <input type="hidden" name="timezone" value={form.timezone} />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Create Account'}
            </button>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account? <Link to="/login" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">Log in</Link>
            </p>
          </form>

        <div className="mt-6 text-center">
          <Link to="/" className="inline-flex items-center text-sm font-semibold text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
          </Link>
        </div>
      </FadeIn>
    </section>
  );
}

function Field({
  label,
  id,
  name,
  type,
  icon: Icon,
  value,
  onChange,
  placeholder,
  inputMode,
  hint,
  code,
  required,
}: {
  label: string;
  id: string;
  name: string;
  type: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
  hint?: string;
  code?: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      {hint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
      <div className="relative mt-2">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          id={id}
          name={name}
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 text-gray-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 ${code ? 'pr-4 text-center text-2xl tracking-[0.5em]' : 'pr-4'}`}
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  id,
  name,
  value,
  onChange,
}: {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className="mt-2 w-full cursor-pointer appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
      >
        {EXPERIENCE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
