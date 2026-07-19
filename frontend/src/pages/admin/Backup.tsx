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
    <section className="relative min-h-[80vh] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-12">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-8">
          <Link to="/admin" className="mb-4 inline-flex items-center text-slate-300 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-white md:text-5xl">System Backup</h1>
          <p className="mt-2 text-lg text-slate-300">Create, restore, and manage platform backups</p>
        </FadeIn>

        {error && <p className="mb-6 rounded-lg bg-red-100 p-4 text-center text-red-700 dark:bg-red-900/30 dark:text-red-200">{error}</p>}

        <FadeIn className="mb-6 rounded-2xl border border-slate-700 bg-slate-800/70 p-6 shadow-lg backdrop-blur-md" delay="0.1s">
          <div className="flex flex-col gap-4 md:flex-row">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Backup name (optional)"
              className="flex-1 rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={createBackup}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="mr-2 h-5 w-5" /> Create Backup
            </button>
          </div>
        </FadeIn>

        <FadeIn className="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 shadow-lg backdrop-blur-md" delay="0.2s">
          <h2 className="mb-4 text-2xl font-bold text-white">Backup History</h2>
          <AsyncSection state={backups} onRetry={backups.reload} skeleton={<BackupListSkeleton />}>
            {backups.data.length === 0 ? (
              <p className="text-slate-300">No backups available.</p>
            ) : (
              <div className="space-y-3">
                {backups.data.map((b) => (
                  <div key={b.id} className="flex flex-col items-start justify-between gap-3 rounded-xl border border-slate-600 bg-slate-900 p-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                        <Database className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{b.name}</p>
                        <p className="text-sm text-slate-400">{new Date(b.created_at).toLocaleString()} · {b.size} · {b.status}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => restore(b.id)}
                        className="inline-flex items-center rounded-xl bg-slate-700 px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-600"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" /> Restore
                      </button>
                      <button
                        onClick={() => remove(b.id)}
                        className="inline-flex items-center rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-red-700"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AsyncSection>
        </FadeIn>
      </div>
    </section>
  );
}

function BackupListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex flex-col items-start justify-between gap-3 rounded-xl border border-slate-600 bg-slate-900 p-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-500/30" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-slate-500/30" />
              <div className="h-3 w-48 rounded bg-slate-500/30" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 rounded-xl bg-slate-500/30" />
            <div className="h-9 w-20 rounded-xl bg-slate-500/30" />
          </div>
        </div>
      ))}
    </div>
  );
}
