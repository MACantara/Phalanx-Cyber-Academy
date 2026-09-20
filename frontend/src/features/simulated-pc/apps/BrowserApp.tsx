import { useEffect, useState } from 'react';
import { useSimulatedPC } from '../context/SimulatedPCContext';
import { AppFrame } from '../components/AppFrame';
import { Globe, Lock, ShieldAlert, FileSearch } from 'lucide-react';
import type { BrowserContent, BrowserSite } from '../types';

export function BrowserApp() {
  const { environment, emit, unlocked, browserUrl } = useSimulatedPC();
  const browser = environment?.content.browser as BrowserContent | undefined;
  const sites = browser?.sites ?? [];
  const [url, setUrl] = useState(browser?.home ?? '');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set());
  const [inspectedIds, setInspectedIds] = useState<Set<string>>(new Set());

  const isLocked = (s: BrowserSite) => !!s.locked && !unlocked.has(s.id);

  const visit = (nextUrl: string) => {
    setUrl(nextUrl);
    setFormValues({});
    const site = sites.find((s) => s.url === nextUrl);
    if (site && !isLocked(site)) {
      emit({ app: 'browser', action: 'visit', target: site.id });
    }
  };

  const inspect = (s: BrowserSite) => {
    if (inspectedIds.has(s.id)) {
      setInspectedIds((prev) => { const n = new Set(prev); n.delete(s.id); return n; });
      return;
    }
    setInspectedIds((prev) => new Set([...prev, s.id]));
    emit({ app: 'browser', action: 'inspect', target: s.id });
  };

  // The environment navigates the browser (openUrl trigger effect) by setting
  // context.browserUrl — e.g. a mail link click.
  useEffect(() => {
    if (browserUrl) visit(browserUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [browserUrl]);

  if (!environment) return null;

  const bookmarks = sites.filter((s) => !isLocked(s));
  const site = sites.find((s) => s.url === url);
  const siteBlocked = site ? isLocked(site) : false;
  const submitted = site ? submittedIds.has(site.id) : false;

  const submit = (s: BrowserSite) => {
    emit({ app: 'browser', action: 'submit', target: s.id, data: { ...formValues } });
    setSubmittedIds((prev) => new Set([...prev, s.id]));
  };

  return (
    <AppFrame title={environment.title} instructions={environment.briefing}>
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b border-ink bg-stock-drift px-3 py-2">
          <Globe className="h-4 w-4 shrink-0 text-ink-soft" />
          <span className="min-w-0 flex-1 truncate border border-hairline bg-stock px-3 py-1.5 font-mono text-[11px] text-ink">
            {url || 'phalanx://start'}
          </span>
          <button
            onClick={() => setUrl('')}
            className="register hidden min-h-[32px] border border-hairline px-3 hover:border-ink sm:block"
          >
            Home
          </button>
        </div>

        {!site && (
          <div className="flex-1 overflow-auto p-4 sm:p-6">
            <span className="register">Known locations</span>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {bookmarks.map((s) => (
                <button
                  key={s.id}
                  onClick={() => visit(s.url)}
                  className="flex min-h-[64px] items-center gap-3 border border-hairline bg-stock px-4 py-3 text-left transition-colors hover:border-ink hover:bg-stock-green"
                >
                  <Globe className="h-5 w-5 shrink-0 text-ink-soft" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{s.title}</span>
                    <span className="block truncate font-mono text-[10px] text-ink-soft">{s.url}</span>
                  </span>
                </button>
              ))}
              {bookmarks.length === 0 && (
                <p className="col-span-full text-sm text-ink-soft">No reachable hosts.</p>
              )}
            </div>
          </div>
        )}

        {site && siteBlocked && (
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="plate max-w-sm p-6 text-center">
              <Lock className="mx-auto mb-3 h-6 w-6 text-strike" />
              <span className="register !text-strike">Connection refused</span>
              <p className="mt-2 text-sm text-ink-soft">This host is not reachable from this machine.</p>
            </div>
          </div>
        )}

        {site && !siteBlocked && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="border-b border-hairline bg-stock-drift px-4 py-3 sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="truncate text-lg font-extrabold tracking-tight">{site.title}</h2>
                {site.inspect && (
                  <button
                    onClick={() => inspect(site)}
                    aria-pressed={inspectedIds.has(site.id)}
                    className={`flex min-h-[44px] shrink-0 items-center border px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em] transition-colors ${
                      inspectedIds.has(site.id)
                        ? 'border-ink bg-ink text-stock'
                        : 'border-ink text-ink hover:bg-stock-green'
                    }`}
                  >
                    <FileSearch className="mr-1 h-3 w-3" /> Inspect
                  </button>
                )}
                {site.form && (
                  <span className="flex shrink-0 items-center border border-strike px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-strike">
                    <ShieldAlert className="mr-1 h-3 w-3" /> Requests credentials
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 sm:p-6">
              {inspectedIds.has(site.id) && site.inspect && (
                <div className="mb-4 border border-hairline border-l-2 border-l-ink bg-stock-drift p-3">
                  <p className="register mb-2">Host record</p>
                  <ul className="space-y-1 font-mono text-[11px] text-ink-soft">
                    {site.inspect.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink sm:text-base">{site.body}</p>

              {site.form && !submitted && (
                <form
                  className="plate mt-5 max-w-sm space-y-3 p-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit(site);
                  }}
                >
                  {site.form.fields.map((field) => (
                    <label key={field.id} className="block">
                      <span className="register mb-1 block">{field.label}</span>
                      <input
                        type={field.password ? 'password' : 'text'}
                        value={formValues[field.id] ?? ''}
                        onChange={(e) =>
                          setFormValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                        }
                        className="min-h-[44px] w-full border border-ink bg-stock px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-seal"
                      />
                    </label>
                  ))}
                  <button
                    type="submit"
                    className="min-h-[44px] w-full bg-ink px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock hover:bg-seal hover:text-seal-ink"
                  >
                    {site.form.submitLabel ?? 'Submit'}
                  </button>
                </form>
              )}

              {submitted && (
                <div className="mt-5 max-w-sm border border-hairline border-l-2 border-l-strike bg-stock-drift p-4">
                  <p className="text-sm text-ink-soft">
                    {site.afterSubmit ?? 'Submitted.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppFrame>
  );
}
