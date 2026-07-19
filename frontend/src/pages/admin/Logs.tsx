import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useData } from '../../hooks/useData';
import AsyncSection from '../../components/AsyncSection';
import { FadeIn } from '../../components/Animated';
import { Search, ChevronLeft, ChevronRight, ArrowLeft, Download } from 'lucide-react';

interface LogEntry {
  id: string;
  type: string;
  timestamp?: string;
  message: string;
  status: string;
  details?: string;
}

interface LogsResponse {
  logs: LogEntry[];
  total: number;
}

const initialLogs: LogsResponse = { logs: [], total: 0 };

const EVENT_TYPES = ['all', 'login', 'verification', 'contact', 'session', 'registration'];

export default function Logs() {
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);
  const [search, setSearch] = useState('');
  const [eventType, setEventType] = useState('all');

  const logsData = useData<LogsResponse>(async () => {
    const params: Record<string, unknown> = { page, per_page: perPage, search };
    if (eventType !== 'all') params.event_type = eventType;
    const res = await api.get('/admin/logs', { params });
    return { logs: res.data.logs || [], total: res.data.total || 0 };
  }, [page, perPage, search, eventType], { initial: initialLogs });

  const exportLogs = async () => {
    const params: Record<string, unknown> = { search };
    if (eventType !== 'all') params.event_type = eventType;
    const res = await api.get('/admin/logs/export', { params, responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phalanx_logs_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(logsData.data.total / perPage));

  const statusClass = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('success') || s.includes('verified')) return 'text-green-300';
    if (s.includes('fail') || s.includes('error')) return 'text-red-300';
    return 'text-yellow-300';
  };

  return (
    <section className="relative min-h-[80vh] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-12">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-8">
          <Link to="/admin" className="mb-4 inline-flex items-center text-slate-300 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-white md:text-5xl">System Logs</h1>
          <p className="mt-2 text-lg text-slate-300">Security events, login attempts, and email verifications</p>
        </FadeIn>

        <FadeIn className="mb-6" delay="0.1s">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search logs..."
                className="w-full rounded-xl border border-slate-600 bg-slate-800 py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <select
              value={eventType}
              onChange={(e) => {
                setEventType(e.target.value);
                setPage(1);
              }}
              className="cursor-pointer rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>{t === 'all' ? 'All Event Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            <button
              onClick={exportLogs}
              className="inline-flex items-center justify-center rounded-xl bg-slate-700 px-4 py-3 font-semibold text-white transition-all hover:bg-slate-600"
            >
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </button>
          </div>
        </FadeIn>

        <FadeIn className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/70 shadow-lg backdrop-blur-md" delay="0.2s">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-600 bg-slate-700/50 text-slate-200">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              <AsyncSection state={logsData} onRetry={logsData.reload} skeleton={<LogsTableSkeleton />}>
                {logsData.data.logs.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-6 text-center">No logs found.</td></tr>
                ) : (
                  logsData.data.logs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="px-4 py-3 capitalize">{log.type}</td>
                      <td className="px-4 py-3">{log.message}</td>
                      <td className={`px-4 py-3 font-medium ${statusClass(log.status)}`}>{log.status}</td>
                      <td className="px-4 py-3 text-slate-400">{log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}</td>
                    </tr>
                  ))
                )}
              </AsyncSection>
            </tbody>
          </table>
        </FadeIn>

        {totalPages > 1 && (
          <FadeIn className="mt-6 flex items-center justify-between text-slate-300" delay="0.3s">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center rounded-xl bg-slate-800 px-4 py-2 text-white transition-all hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center rounded-xl bg-slate-800 px-4 py-2 text-white transition-all hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </button>
          </FadeIn>
        )}
      </div>
    </section>
  );
}

function LogsTableSkeleton() {
  return (
    <>
      <tr className="border-b border-slate-600">
        <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-slate-500/30" /></td>
        <td className="px-4 py-3"><div className="h-4 w-96 rounded bg-slate-500/30" /></td>
        <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-slate-500/30" /></td>
        <td className="px-4 py-3"><div className="h-4 w-32 rounded bg-slate-500/30" /></td>
      </tr>
      {[...Array(4)].map((_, i) => (
        <tr key={i} className="border-b border-slate-700/50">
          <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-slate-500/30" /></td>
          <td className="px-4 py-3"><div className="h-4 w-80 rounded bg-slate-500/30" /></td>
          <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-slate-500/30" /></td>
          <td className="px-4 py-3"><div className="h-4 w-28 rounded bg-slate-500/30" /></td>
        </tr>
      ))}
    </>
  );
}
