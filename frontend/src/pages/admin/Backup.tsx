import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useData } from '../../hooks/useData';
import AsyncSection from '../../components/AsyncSection';
import { FadeIn } from '../../components/Animated';
import { ArrowLeft, Database, RotateCcw, Trash2, Plus } from 'lucide-react';

interface BackupRecord {
  id: string;
  name: string;
  created_at: string;
  size: string;
  status: string;
}

export default function Backup() {
  const backups = useData<BackupRecord[]>(async () => {
    const res = await api.get('/admin/backups/backups');
    return res.data.backups || [];
  }, [], { initial: [] });

  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => backups.reload();

  const createBackup = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/admin/backups/backups', { name: newName || `Backup ${new Date().toLocaleString()}` });
      setNewName('');
      refresh();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const restore = async (id: string) => {
    setError(null);
    try {
      await api.post(`/admin/backups/backups/${id}/restore`);
      alert('Backup restore initiated');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  const remove = async (id: string) => {
    setError(null);
    try {
      await api.delete(`/admin/backups/backups/${id}`);
      refresh();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  return (
    <section className="min-h-[80vh] bg-stock py-12">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <FadeIn className="mb-8">
          <Link to="/admin" className="mb-4 inline-flex items-center font-mono text-xs uppercase tracking-[0.14em] text-seal-ink underline-offset-[3px] hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
          <span className="register block">Admin — Backup Register</span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">System Backup</h1>
          <p className="mt-2 text-sm text-ink-soft sm:text-base">Create, restore, and manage platform backups</p>
        </FadeIn>

        {error && <p className="mb-6 border border-strike/60 bg-stock px-4 py-3 font-mono text-sm text-strike">{error}</p>}

        <FadeIn className="plate mb-6 p-4" delay="0.1s">
          <div className="flex flex-col gap-4 sm:flex-row">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Backup name (optional)"
              className="flex-1 border border-hairline bg-stock px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-seal-ink focus:outline-none focus:ring-2 focus:ring-seal-ink/40"
            />
            <button
              onClick={createBackup}
              disabled={loading}
              className="inline-flex min-h-[44px] items-center justify-center bg-ink px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink hover:text-stock disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-seal dark:hover:text-seal-ink"
            >
              <Plus className="mr-2 h-5 w-5" /> Create Backup
            </button>
          </div>
        </FadeIn>

        <FadeIn className="plate plate-strong" delay="0.2s">
          <div className="border-b border-hairline px-5 py-4">
            <h2 className="text-lg font-bold tracking-tight text-ink">Backup History</h2>
          </div>
          <div className="p-5">
            <AsyncSection state={backups} onRetry={backups.reload} skeleton={<BackupListSkeleton />}>
              {backups.data.length === 0 ? (
                <p className="text-sm text-ink-soft">No backups available.</p>
              ) : (
                <div className="space-y-3">
                  {backups.data.map((b) => (
                    <div key={b.id} className="flex flex-col items-start justify-between gap-3 border border-hairline bg-stock p-4 transition-colors hover:border-ink sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-hairline text-ink">
                          <Database className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-ink">{b.name}</p>
                          <p className="mt-0.5 font-mono text-xs text-ink-soft">{new Date(b.created_at).toLocaleString()} · {b.size} · {b.status}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => restore(b.id)}
                          className="inline-flex min-h-[44px] items-center border border-hairline bg-stock px-3 py-2 font-mono text-xs uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink hover:bg-stock-green"
                        >
                          <RotateCcw className="mr-2 h-4 w-4" /> Restore
                        </button>
                        <button
                          onClick={() => remove(b.id)}
                          className="inline-flex min-h-[44px] items-center border border-strike px-3 py-2 font-mono text-xs uppercase tracking-[0.14em] text-strike transition-colors hover:bg-strike/10"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AsyncSection>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function BackupListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex flex-col items-start justify-between gap-3 border border-hairline bg-stock p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-ink-soft/20" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-ink-soft/20" />
              <div className="h-3 w-48 bg-ink-soft/20" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-11 w-24 bg-ink-soft/20" />
            <div className="h-11 w-20 bg-ink-soft/20" />
          </div>
        </div>
      ))}
    </div>
  );
}
