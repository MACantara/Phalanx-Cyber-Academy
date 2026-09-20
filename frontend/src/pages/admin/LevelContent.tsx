import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { api } from '../../lib/api';
import { useData } from '../../hooks/useData';
import AsyncSection from '../../components/AsyncSection';
import { FadeIn } from '../../components/Animated';
import { getApp } from '../../features/simulated-pc/apps';
import { toEnvironment } from '../../features/simulated-pc/lib/environment';
import {
  levelEnvironmentSchema,
  validateAppContent,
  issuesOf,
} from '../../features/simulated-pc/lib/schemas';

interface LevelMeta {
  level_id: number;
  name: string;
}

interface LevelsResponse {
  levels: LevelMeta[];
}

export default function LevelContent() {
  const [levelId, setLevelId] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [issues, setIssues] = useState<string[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const levels = useData<LevelsResponse>(
    async () => (await api.get('/levels/')).data,
    [],
    { initial: { levels: [] } }
  );

  const load = async (id: number) => {
    setLevelId(id);
    setIssues(null);
    setNotice(null);
    const res = await api.get(`/admin/levels/${id}/content`);
    setText(JSON.stringify(res.data.content ?? {}, null, 2));
  };

  const validate = (): string[] => {
    const out: string[] = [];
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      return [`JSON parse error: ${(e as Error).message}`];
    }
    /* Legacy payloads (email-sandbox etc.) are accepted too — they wrap into
       an environment at serve time via toEnvironment, same as the sim does. */
    const env =
      (parsed as { environment?: boolean }).environment === true
        ? levelEnvironmentSchema.safeParse(parsed)
        : (() => {
            const wrapped = toEnvironment(parsed as Parameters<typeof toEnvironment>[0]);
            return wrapped
              ? levelEnvironmentSchema.safeParse(wrapped)
              : { success: false as const, error: null };
          })();
    if (!env.success) {
      if (env.error) {
        out.push(...issuesOf(env.error).map((i) => `env.${i.path}: ${i.message}`));
      } else {
        out.push('Unrecognized content shape — not an environment and not a known legacy type');
      }
      return out;
    }
    for (const install of env.data.apps) {
      const appIssues = validateAppContent(
        env.data.content[install.appId],
        getApp(install.appId)?.schema
      );
      out.push(...appIssues.map((i) => `${install.appId}.${i.path}: ${i.message}`));
      if (getApp(install.appId) === undefined) {
        out.push(`apps: unknown appId '${install.appId}' — not in registry`);
      }
    }
    return out;
  };

  const onValidate = () => {
    const out = validate();
    setIssues(out);
    setNotice(out.length === 0 ? 'Valid — ready to publish' : null);
    return out;
  };

  const save = async () => {
    if (levelId === null) return;
    const out = onValidate();
    if (out.length > 0) return;
    setSaving(true);
    try {
      await api.put(`/admin/levels/${levelId}/content`, { content: JSON.parse(text) });
      setNotice('Published — the level now serves this environment');
    } catch (e: any) {
      setIssues([e?.response?.data?.detail ?? 'Save failed']);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="min-h-[80vh] bg-stock py-12">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <FadeIn className="mb-8">
          <Link to="/admin" className="register inline-flex items-center gap-1 text-ink-soft hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> Admin
          </Link>
          <span className="register mt-4 block">Content Platform — Levels</span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">Level Content Editor</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Edit a level's environment spec (apps, content slices, scenario, scoring). Use{' '}
            <code className="font-mono">lib:kind:key</code> strings to reference library items.
          </p>
        </FadeIn>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <select
            className="min-h-[44px] border border-hairline bg-stock px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
            value={levelId ?? ''}
            onChange={(e) => load(Number(e.target.value))}
          >
            <option value="">Select a level…</option>
            {(levels.data?.levels ?? []).map((l) => (
              <option key={l.level_id} value={l.level_id}>
                L{l.level_id} — {l.name}
              </option>
            ))}
          </select>
          {levelId !== null && (
            <Link
              to={`/levels/${levelId}`}
              target="_blank"
              className="flex min-h-[44px] items-center gap-2 border border-hairline px-4 font-mono text-xs uppercase tracking-[0.14em] text-ink hover:border-ink"
            >
              Preview <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {levelId !== null && (
          <AsyncSection state={levels} onRetry={() => load(levelId)}>
            <div className="plate p-5">
              <textarea
                rows={24}
                className="w-full border border-hairline bg-stock px-3 py-2 font-mono text-xs leading-relaxed text-ink focus:border-ink focus:outline-none"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setIssues(null);
                }}
                spellCheck={false}
              />
              {issues && issues.length > 0 && (
                <ul className="mt-3 max-h-40 space-y-1 overflow-auto border border-strike p-3 font-mono text-[11px] text-strike">
                  {issues.slice(0, 20).map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                  {issues.length > 20 && <li>…and {issues.length - 20} more</li>}
                </ul>
              )}
              {notice && (
                <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-confirm">{notice}</p>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={onValidate}
                  className="min-h-[44px] border border-hairline px-5 font-mono text-xs uppercase tracking-[0.14em] text-ink hover:border-ink"
                >
                  Validate
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="min-h-[44px] bg-ink px-5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock hover:bg-seal-ink disabled:opacity-50"
                >
                  {saving ? 'Publishing…' : 'Validate & Publish'}
                </button>
              </div>
            </div>
          </AsyncSection>
        )}
      </div>
    </section>
  );
}
