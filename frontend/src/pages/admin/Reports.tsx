import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useData } from '../../hooks/useData';
import AsyncSection from '../../components/AsyncSection';
import { FadeIn } from '../../components/Animated';
import { ArrowLeft, FileText, Download } from 'lucide-react';

interface UserOption {
  id: number;
  username: string | null;
  email: string;
}

export default function Reports() {
  const users = useData<UserOption[]>(async () => {
    const res = await api.get('/users/?per_page=100');
    return res.data.users || [];
  }, [], { initial: [] });

  const [selected, setSelected] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadCertificate = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/admin/reports/certificate/${selected}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'certificate.docx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-[80vh] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-12">
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-8">
          <Link to="/admin" className="mb-4 inline-flex items-center text-slate-300 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-white md:text-5xl">Reports & Documents</h1>
          <p className="mt-2 text-lg text-slate-300">Generate Word documents from user data</p>
        </FadeIn>

        {error && <p className="mb-6 rounded-lg bg-red-100 p-4 text-center text-red-700 dark:bg-red-900/30 dark:text-red-200">{error}</p>}

        <FadeIn className="rounded-2xl border border-slate-700 bg-slate-800/70 p-8 shadow-lg backdrop-blur-md" delay="0.1s">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Certificate of Achievement</h2>
              <p className="text-slate-300">Generate a completion certificate for a selected user.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <AsyncSection state={users} onRetry={users.reload} skeleton={<ReportsUserSkeleton />}>
              <div>
                <label htmlFor="user" className="block text-sm font-semibold text-slate-300">Select user</label>
                <select
                  id="user"
                  value={selected}
                  onChange={(e) => setSelected(Number(e.target.value) || '')}
                  className="mt-2 w-full cursor-pointer rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Choose a user</option>
                  {users.data.map((u) => (
                    <option key={u.id} value={u.id}>{u.username || u.email}</option>
                  ))}
                </select>
              </div>
            </AsyncSection>

            <button
              onClick={downloadCertificate}
              disabled={!selected || loading}
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="mr-2 h-5 w-5" /> {loading ? 'Generating...' : 'Download Certificate'}
            </button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function ReportsUserSkeleton() {
  return (
    <div>
      <div className="mb-2 h-4 w-24 rounded bg-slate-500/30" />
      <div className="h-12 w-full rounded-xl bg-slate-500/30" />
    </div>
  );
}
