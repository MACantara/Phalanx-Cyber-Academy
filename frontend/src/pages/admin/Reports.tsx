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
    <section className="min-h-[80vh] bg-stock py-12">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <FadeIn className="mb-8">
          <Link to="/admin" className="mb-4 inline-flex items-center font-mono text-xs uppercase tracking-[0.14em] text-seal-ink underline-offset-[3px] hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
          <span className="register block">Admin — Document Register</span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Reports & Documents</h1>
          <p className="mt-2 text-sm text-ink-soft sm:text-base">Generate Word documents from user data</p>
        </FadeIn>

        {error && <p className="mb-6 border border-strike/60 bg-stock px-4 py-3 font-mono text-sm text-strike">{error}</p>}

        <FadeIn className="plate plate-strong p-6 sm:p-8" delay="0.1s">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-seal text-seal-ink">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-ink">Certificate of Achievement</h2>
              <p className="mt-1 text-sm text-ink-soft">Generate a completion certificate for a selected user.</p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <AsyncSection state={users} onRetry={users.reload} skeleton={<ReportsUserSkeleton />}>
              <div>
                <label htmlFor="user" className="register mb-2 block">Select user</label>
                <select
                  id="user"
                  value={selected}
                  onChange={(e) => setSelected(Number(e.target.value) || '')}
                  className="mt-2 w-full cursor-pointer border border-hairline bg-stock px-4 py-3 text-sm text-ink focus:border-seal-ink focus:outline-none focus:ring-2 focus:ring-seal-ink/40"
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
              className="inline-flex min-h-[44px] items-center justify-center bg-ink px-8 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink hover:text-stock disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-seal dark:hover:text-seal-ink"
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
      <div className="mb-2 h-3 w-24 bg-ink-soft/20" />
      <div className="h-12 w-full bg-ink-soft/20" />
    </div>
  );
}
