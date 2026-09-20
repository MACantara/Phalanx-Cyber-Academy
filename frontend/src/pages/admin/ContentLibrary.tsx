import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useData } from '../../hooks/useData';
import AsyncSection from '../../components/AsyncSection';
import { FadeIn } from '../../components/Animated';
import { SchemaForm } from '../../components/SchemaForm';
import { contentItemSchemas, contentKinds, type ContentKind, issuesOf } from '../../features/simulated-pc/lib/schemas';

interface ContentItem {
  id: string;
  kind: string;
  key: string;
  data: Record<string, unknown>;
  updated_at?: string;
}

interface ItemsResponse {
  items: ContentItem[];
}

const KIND_LABELS: Record<ContentKind, string> = {
  emails: 'Emails',
  articles: 'Articles',
  files: 'Files',
  sites: 'Browser Sites',
  scenes: 'Case Scenes',
  evidence: 'Evidence',
};

interface Editor {
  mode: 'create' | 'edit';
  id?: string;
  kind: ContentKind;
  key: string;
  data: Record<string, unknown>;
}

export default function ContentLibrary() {
  const [kind, setKind] = useState<ContentKind>('emails');
  const [editor, setEditor] = useState<Editor | null>(null);
  const [formError, setFormError] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const items = useData<ItemsResponse>(
    async () => (await api.get('/admin/content-items', { params: { kind } })).data,
    [kind],
    { initial: { items: [] } }
  );

  const openCreate = () => {
    setEditor({ mode: 'create', kind, key: '', data: {} });
    setFormError([]);
  };

  const openEdit = (item: ContentItem) => {
    setEditor({ mode: 'edit', id: item.id, kind: item.kind as ContentKind, key: item.key, data: item.data });
    setFormError([]);
  };

  const save = async () => {
    if (!editor) return;
    const schema = contentItemSchemas[editor.kind];
    const res = schema.safeParse(editor.data);
    if (!res.success) {
      setFormError(issuesOf(res.error).map((i) => `${i.path || '(root)'}: ${i.message}`));
      return;
    }
    if (editor.mode === 'create' && !editor.key.trim()) {
      setFormError(['key: required (the ref will be lib:' + editor.kind + ':<key>)']);
      return;
    }
    setSaving(true);
    setFormError([]);
    try {
      if (editor.mode === 'create') {
        await api.post('/admin/content-items', { kind: editor.kind, key: editor.key.trim(), data: editor.data });
      } else {
        await api.put(`/admin/content-items/${editor.id}`, { data: editor.data });
      }
      setNotice(`Saved ${editor.kind}:${editor.key || 'item'}`);
      setEditor(null);
      items.reload();
    } catch (e: any) {
      setFormError([e?.response?.data?.detail ?? 'Save failed']);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: ContentItem) => {
    if (!window.confirm(`Delete ${item.kind}:${item.key}? Levels referencing lib:${item.kind}:${item.key} will fail validation.`)) return;
    await api.delete(`/admin/content-items/${item.id}`);
    items.reload();
  };

  return (
    <section className="min-h-[80vh] bg-stock py-12">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <FadeIn className="mb-8">
          <Link to="/admin" className="register inline-flex items-center gap-1 text-ink-soft hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> Admin
          </Link>
          <span className="register mt-4 block">Content Platform — Library</span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">Content Library</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Shared exhibits any level can reference as <code className="font-mono">lib:kind:key</code>
          </p>
        </FadeIn>

        <div className="mb-6 flex flex-wrap gap-2">
          {contentKinds.map((k) => (
            <button
              key={k}
              onClick={() => {
                setKind(k);
                setEditor(null);
              }}
              className={`min-h-[44px] border px-4 font-mono text-xs uppercase tracking-[0.14em] transition-colors ${
                kind === k ? 'border-ink bg-ink text-stock' : 'border-hairline text-ink hover:border-ink'
              }`}
            >
              {KIND_LABELS[k]}
            </button>
          ))}
          <button
            onClick={openCreate}
            className="ml-auto flex min-h-[44px] items-center gap-2 bg-seal px-4 font-mono text-xs font-bold uppercase tracking-[0.14em] text-seal-ink hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New {KIND_LABELS[kind]}
          </button>
        </div>

        {notice && (
          <div className="mb-4 border border-confirm bg-stock px-4 py-3 font-mono text-xs uppercase tracking-[0.14em] text-confirm">
            {notice}
          </div>
        )}

        {editor && (
          <div className="plate mb-6 p-5">
            <p className="register mb-4">
              {editor.mode === 'create' ? `New item — ${KIND_LABELS[editor.kind]}` : `Editing ${editor.kind}:${editor.key}`}
            </p>
            {editor.mode === 'create' && (
              <label className="mb-4 block">
                <span className="register">key (ref: lib:{editor.kind}:&lt;key&gt;)</span>
                <input
                  type="text"
                  className="mt-1 min-h-[44px] w-full border border-hairline bg-stock px-3 py-2 font-mono text-sm text-ink focus:border-ink focus:outline-none"
                  value={editor.key}
                  onChange={(e) => setEditor({ ...editor, key: e.target.value })}
                  placeholder="msg-42"
                />
              </label>
            )}
            <SchemaForm
              schema={contentItemSchemas[editor.kind]}
              value={editor.data}
              onChange={(data) => setEditor({ ...editor, data })}
            />
            {formError.length > 0 && (
              <ul className="mt-3 space-y-1 font-mono text-[11px] text-strike">
                {formError.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex gap-2">
              <button
                onClick={save}
                disabled={saving}
                className="min-h-[44px] bg-ink px-5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock hover:bg-seal-ink disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save item'}
              </button>
              <button
                onClick={() => setEditor(null)}
                className="min-h-[44px] border border-hairline px-5 font-mono text-xs uppercase tracking-[0.14em] text-ink hover:border-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <AsyncSection state={items} onRetry={items.reload}>
          {(items.data?.items ?? []).length === 0 ? (
            <div className="plate p-8 text-center">
              <p className="register text-ink-soft">No {KIND_LABELS[kind].toLowerCase()} in the library yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-hairline border border-hairline">
              {items.data!.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm font-bold text-ink">lib:{item.kind}:{item.key}</p>
                    <p className="truncate text-xs text-ink-soft">
                      {(item.data.subject as string) ?? (item.data.title as string) ?? (item.data.name as string) ?? item.id}
                    </p>
                  </div>
                  <button
                    onClick={() => openEdit(item)}
                    className="min-h-[44px] border border-hairline px-4 font-mono text-xs uppercase tracking-[0.14em] text-ink hover:border-ink"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(item)}
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center border border-hairline text-strike hover:border-strike"
                    aria-label={`Delete ${item.key}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </AsyncSection>
      </div>
    </section>
  );
}
