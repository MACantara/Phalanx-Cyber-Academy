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
    <section className="min-h-[80vh] bg-stock py-12">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <FadeIn className="mb-8">
          <Link to="/admin/backups" className="mb-4 inline-flex items-center font-mono text-xs uppercase tracking-[0.14em] text-seal-ink underline-offset-[3px] hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Backups
          </Link>
          <span className="register block">Admin — Schedule Register</span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Backup Schedule</h1>
          <p className="mt-2 text-sm text-ink-soft sm:text-base">Configure automatic backup retention and timing</p>
        </FadeIn>

        {message && <p className="mb-6 border border-confirm/60 bg-stock px-4 py-3 font-mono text-sm text-confirm">{message}</p>}
        {error && <p className="mb-6 border border-strike/60 bg-stock px-4 py-3 font-mono text-sm text-strike">{error}</p>}

        <FadeIn className="plate plate-strong p-6 sm:p-8" delay="0.1s">
          <AsyncSection state={remoteSchedule} onRetry={remoteSchedule.reload} skeleton={<ScheduleFormSkeleton />}>
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 border border-hairline bg-stock p-4">
                <div className="flex items-center">
                  <Clock className="mr-3 h-6 w-6 shrink-0 text-seal-ink" />
                  <div>
                    <p className="font-semibold text-ink">Enable scheduled backups</p>
                    <p className="mt-0.5 text-sm text-ink-soft">Automatically create backups on a recurring interval</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-[10px] uppercase tracking-[0.16em] ${schedule.enabled ? 'text-confirm' : 'text-ink-soft'}`}>
                    {schedule.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={schedule.enabled}
                      onChange={(e) => setSchedule({ ...schedule, enabled: e.target.checked })}
                      className="peer sr-only"
                    />
                    <div className="relative h-6 w-11 border border-ink bg-stock transition-colors after:absolute after:left-[3px] after:top-[3px] after:h-4 after:w-4 after:bg-ink-soft after:transition-all peer-checked:after:translate-x-5 peer-checked:after:bg-confirm" />
                  </label>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="frequency" className="register mb-2 block">Frequency</label>
                  <select
                    id="frequency"
                    value={schedule.frequency}
                    onChange={(e) => setSchedule({ ...schedule, frequency: e.target.value })}
                    className="mt-2 w-full cursor-pointer border border-hairline bg-stock px-4 py-3 text-sm text-ink focus:border-seal-ink focus:outline-none focus:ring-2 focus:ring-seal-ink/40"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="time" className="register mb-2 block">Time</label>
                  <input
                    id="time"
                    type="time"
                    value={schedule.time}
                    onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
                    className="mt-2 w-full border border-hairline bg-stock px-4 py-3 text-sm text-ink focus:border-seal-ink focus:outline-none focus:ring-2 focus:ring-seal-ink/40"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="retention" className="register mb-2 block">Retention (days)</label>
                <input
                  id="retention"
                  type="number"
                  min={1}
                  max={365}
                  value={schedule.retention_days}
                  onChange={(e) => setSchedule({ ...schedule, retention_days: Number(e.target.value) })}
                  className="mt-2 w-full border border-hairline bg-stock px-4 py-3 text-sm text-ink focus:border-seal-ink focus:outline-none focus:ring-2 focus:ring-seal-ink/40"
                />
              </div>

              {schedule.next_run && (
                <div className="flex items-center font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">
                  <Calendar className="mr-2 h-4 w-4" />
                  Next run: {new Date(schedule.next_run).toLocaleString()}
                </div>
              )}

              <button
                onClick={saveSchedule}
                disabled={saving}
                className="inline-flex min-h-[44px] w-full items-center justify-center bg-ink px-8 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink hover:text-stock disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-seal dark:hover:text-seal-ink"
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
      <div className="flex items-center justify-between border border-hairline bg-stock p-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 bg-ink-soft/20" />
          <div className="space-y-2">
            <div className="h-4 w-40 bg-ink-soft/20" />
            <div className="h-3 w-56 bg-ink-soft/20" />
          </div>
        </div>
        <div className="h-6 w-11 bg-ink-soft/20" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-ink-soft/20" />
          <div className="h-12 w-full bg-ink-soft/20" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-12 bg-ink-soft/20" />
          <div className="h-12 w-full bg-ink-soft/20" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-3 w-28 bg-ink-soft/20" />
        <div className="h-12 w-full bg-ink-soft/20" />
      </div>

      <div className="flex items-center gap-2">
        <div className="h-4 w-4 bg-ink-soft/20" />
        <div className="h-4 w-32 bg-ink-soft/20" />
      </div>

      <div className="h-12 w-full bg-ink-soft/20" />
    </div>
  );
}
