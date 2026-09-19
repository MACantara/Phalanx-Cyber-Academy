import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useData } from '../../hooks/useData';
import AsyncSection from '../../components/AsyncSection';
import { FadeIn } from '../../components/Animated';
import { Pagination } from '../../components/Pagination';
import { Search, ArrowLeft, Download } from 'lucide-react';

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
    if (s.includes('success') || s.includes('verified')) return 'text-confirm';
    if (s.includes('fail') || s.includes('error')) return 'text-strike';
    return 'text-ink-soft';
  };

  return (
    <section className="min-h-[80vh] bg-stock py-12">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <FadeIn className="mb-8">
          <Link to="/admin" className="mb-4 inline-flex items-center font-mono text-xs uppercase tracking-[0.14em] text-seal-ink underline-offset-[3px] hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
          <span className="register block">Admin — Event Register</span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">System Logs</h1>
          <p className="mt-2 text-sm text-ink-soft sm:text-base">Security events, login attempts, and email verifications</p>
        </FadeIn>

        <FadeIn className="mb-6" delay="0.1s">
          <div className="plate flex flex-col gap-4 p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search logs..."
                className="w-full border border-hairline bg-stock py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-soft/60 focus:border-seal-ink focus:outline-none focus:ring-2 focus:ring-seal-ink/40"
              />
            </div>
            <select
              value={eventType}
              onChange={(e) => {
                setEventType(e.target.value);
                setPage(1);
              }}
              className="cursor-pointer border border-hairline bg-stock px-4 py-2.5 text-sm text-ink focus:border-seal-ink focus:outline-none focus:ring-2 focus:ring-seal-ink/40"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>{t === 'all' ? 'All Event Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            <button
              onClick={exportLogs}
              className="inline-flex min-h-[44px] items-center justify-center border border-hairline bg-stock px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink hover:bg-stock-green"
            >
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </button>
          </div>
        </FadeIn>

        <FadeIn className="overflow-x-auto" delay="0.2s">
          <table className="min-w-full border border-ink bg-stock text-left text-sm text-ink">
            <thead className="bg-stock-drift font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-normal">Type</th>
                <th className="px-4 py-3 font-normal">Message</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              <AsyncSection state={logsData} onRetry={logsData.reload} skeleton={<LogsTableSkeleton />}>
                {logsData.data.logs.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-ink-soft">No logs found.</td></tr>
                ) : (
                  logsData.data.logs.map((log) => (
                    <tr key={log.id} className="transition-colors hover:bg-stock-green">
                      <td className="px-4 py-3 font-mono text-xs uppercase">{log.type}</td>
                      <td className="px-4 py-3">{log.message}</td>
                      <td className={`px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] ${statusClass(log.status)}`}>{log.status}</td>
                      <td className="px-4 py-3 font-mono text-xs text-ink-soft">{log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}</td>
                    </tr>
                  ))
                )}
              </AsyncSection>
            </tbody>
          </table>
        </FadeIn>

        {totalPages > 1 && (
          <FadeIn className="mt-6" delay="0.3s">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </FadeIn>
        )}
      </div>
    </section>
  );
}

function LogsTableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i}>
          <td className="px-4 py-3"><div className="h-4 w-16 bg-ink-soft/20" /></td>
          <td className="px-4 py-3"><div className="h-4 w-80 max-w-full bg-ink-soft/20" /></td>
          <td className="px-4 py-3"><div className="h-4 w-16 bg-ink-soft/20" /></td>
          <td className="px-4 py-3"><div className="h-4 w-28 bg-ink-soft/20" /></td>
        </tr>
      ))}
    </>
  );
}
