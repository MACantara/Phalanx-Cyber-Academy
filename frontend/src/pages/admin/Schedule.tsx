import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useData } from '../../hooks/useData';
import AsyncSection from '../../components/AsyncSection';
import { FadeIn } from '../../components/Animated';
import { ArrowLeft, Clock, Save, Calendar } from 'lucide-react';

interface ScheduleConfig {
  enabled: boolean;
  frequency: string;
  time: string;
  retention_days: number;
  next_run?: string;
}

const initialSchedule: ScheduleConfig = {
  enabled: true,
  frequency: 'daily',
  time: '02:00',
  retention_days: 7,
};

export default function Schedule() {
  const remoteSchedule = useData<ScheduleConfig>(async () => {
    const res = await api.get('/admin/backups/schedule');
    return res.data.schedule;
  }, [], { initial: initialSchedule });

  const [schedule, setSchedule] = useState<ScheduleConfig>(initialSchedule);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (remoteSchedule.data) {
      setSchedule(remoteSchedule.data);
    }
  }, [remoteSchedule.data]);

  const saveSchedule = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await api.put('/admin/backups/schedule', schedule);
      setSchedule(res.data.schedule);
      setMessage('Schedule saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="relative min-h-[80vh] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-12">
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-8">
          <Link to="/admin/backups" className="mb-4 inline-flex items-center text-slate-300 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Backups
          </Link>
          <h1 className="text-4xl font-bold text-white md:text-5xl">Backup Schedule</h1>
          <p className="mt-2 text-lg text-slate-300">Configure automatic backup retention and timing</p>
        </FadeIn>

        {message && <p className="mb-6 rounded-lg bg-green-100 p-4 text-center text-green-800 dark:bg-green-900/30 dark:text-green-200">{message}</p>}
        {error && <p className="mb-6 rounded-lg bg-red-100 p-4 text-center text-red-700 dark:bg-red-900/30 dark:text-red-200">{error}</p>}

        <FadeIn className="rounded-2xl border border-slate-700 bg-slate-800/70 p-8 shadow-lg backdrop-blur-md" delay="0.1s">
          <AsyncSection state={remoteSchedule} onRetry={remoteSchedule.reload} skeleton={<ScheduleFormSkeleton />}>
            <div className="space-y-6">
              <div className="flex items-center justify-between rounded-xl border border-slate-600 bg-slate-900 p-4">
                <div className="flex items-center">
                  <Clock className="mr-3 h-6 w-6 text-blue-400" />
                  <div>
                    <p className="font-semibold text-white">Enable scheduled backups</p>
                    <p className="text-sm text-slate-400">Automatically create backups on a recurring interval</p>
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={schedule.enabled}
                    onChange={(e) => setSchedule({ ...schedule, enabled: e.target.checked })}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-slate-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full" />
                </label>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="frequency" className="mb-2 block font-semibold text-slate-300">Frequency</label>
                  <select
                    id="frequency"
                    value={schedule.frequency}
                    onChange={(e) => setSchedule({ ...schedule, frequency: e.target.value })}
                    className="w-full cursor-pointer rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="time" className="mb-2 block font-semibold text-slate-300">Time</label>
                  <input
                    id="time"
                    type="time"
                    value={schedule.time}
                    onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
                    className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="retention" className="mb-2 block font-semibold text-slate-300">Retention (days)</label>
                <input
                  id="retention"
                  type="number"
                  min={1}
                  max={365}
                  value={schedule.retention_days}
                  onChange={(e) => setSchedule({ ...schedule, retention_days: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {schedule.next_run && (
                <div className="flex items-center text-slate-300">
                  <Calendar className="mr-2 h-5 w-5" />
                  Next run: {new Date(schedule.next_run).toLocaleString()}
                </div>
              )}

              <button
                onClick={saveSchedule}
                disabled={saving}
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="mr-2 h-5 w-5" /> {saving ? 'Saving...' : 'Save Schedule'}
              </button>
            </div>
          </AsyncSection>
        </FadeIn>
      </div>
    </section>
  );
}

function ScheduleFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-slate-600 bg-slate-900 p-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded bg-slate-500/30" />
          <div className="space-y-2">
            <div className="h-4 w-40 rounded bg-slate-500/30" />
            <div className="h-3 w-56 rounded bg-slate-500/30" />
          </div>
        </div>
        <div className="h-6 w-11 rounded-full bg-slate-500/30" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-slate-500/30" />
          <div className="h-12 w-full rounded-xl bg-slate-500/30" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-12 rounded bg-slate-500/30" />
          <div className="h-12 w-full rounded-xl bg-slate-500/30" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-4 w-28 rounded bg-slate-500/30" />
        <div className="h-12 w-full rounded-xl bg-slate-500/30" />
      </div>

      <div className="flex items-center gap-2">
        <div className="h-5 w-5 rounded bg-slate-500/30" />
        <div className="h-4 w-32 rounded bg-slate-500/30" />
      </div>

      <div className="h-12 w-full rounded-xl bg-slate-500/30" />
    </div>
  );
}
