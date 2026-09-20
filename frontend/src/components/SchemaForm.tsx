import { useMemo, useState } from 'react';
import { z } from 'zod';

/* Schema-driven form: converts a zod object schema to JSON Schema and renders
   one field per property. Scalars/enum get native inputs; composite fields
   (arrays, records, nested objects) get a JSON textarea that parses on blur.
   Admin tooling — errors surface inline per field. */

const TEXTAREA_FIELDS = new Set(['body', 'content', 'narrative', 'explanation', 'afterSubmit', 'description']);

type JsonSchema = {
  type?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  enum?: unknown[];
};

const INPUT = 'mt-1 min-h-[44px] w-full border border-hairline bg-stock px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none';

export function SchemaForm({
  schema,
  value,
  onChange,
}: {
  schema: z.ZodType;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
}) {
  const json = useMemo(() => z.toJSONSchema(schema) as JsonSchema, [schema]);
  const props = json.properties ?? {};
  const required = new Set(json.required ?? []);

  return (
    <div className="space-y-3">
      {Object.entries(props).map(([name, field]) => (
        <SchemaField
          key={name}
          name={name}
          field={field}
          required={required.has(name)}
          value={value[name]}
          onChange={(v) => onChange({ ...value, [name]: v })}
        />
      ))}
      {Object.keys(props).length === 0 && (
        <p className="register !text-strike">Schema has no editable properties</p>
      )}
    </div>
  );
}

function SchemaField({
  name,
  field,
  required,
  value,
  onChange,
}: {
  name: string;
  field: JsonSchema;
  required: boolean;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const label = (
    <span className="register flex items-center gap-2">
      {name}
      {required && <span className="text-strike">*</span>}
      {field.type && <span className="text-ink-soft opacity-60">· {field.type}</span>}
    </span>
  );

  if (field.enum) {
    return (
      <label className="block">
        {label}
        <select
          className={INPUT}
          value={value === undefined ? '' : String(value)}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">—</option>
          {field.enum.map((opt) => (
            <option key={String(opt)} value={String(opt)}>
              {String(opt)}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === 'boolean') {
    return (
      <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          className="h-5 w-5 accent-[var(--seal)]"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
        {label}
      </label>
    );
  }

  if (field.type === 'number' || field.type === 'integer') {
    return (
      <label className="block">
        {label}
        <input
          type="number"
          className={INPUT}
          value={value === undefined || value === null ? '' : String(value)}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        />
      </label>
    );
  }

  if (field.type === 'string' && !TEXTAREA_FIELDS.has(name)) {
    return (
      <label className="block">
        {label}
        <input
          type="text"
          className={INPUT}
          value={value === undefined ? '' : String(value)}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  }

  if (field.type === 'string') {
    return (
      <label className="block">
        {label}
        <textarea
          rows={4}
          className="mt-1 w-full border border-hairline bg-stock px-3 py-2 font-mono text-sm text-ink focus:border-ink focus:outline-none"
          value={value === undefined ? '' : String(value)}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  }

  return <JsonField name={name} label={label} value={value} onChange={onChange} />;
}

/* Composite fields (arrays, records, nested objects, unions) — raw JSON with
   parse-on-blur so malformed JSON never reaches the form state. */
function JsonField({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: React.ReactNode;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const [text, setText] = useState(() => (value === undefined ? '' : JSON.stringify(value, null, 2)));
  const [error, setError] = useState<string | null>(null);

  return (
    <label className="block">
      {label}
      <textarea
        rows={Math.min(10, Math.max(3, text.split('\n').length + 1))}
        className={`mt-1 w-full border bg-stock px-3 py-2 font-mono text-xs text-ink focus:outline-none ${error ? 'border-strike' : 'border-hairline focus:border-ink'}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          if (text.trim() === '') {
            setError(null);
            onChange(undefined);
            return;
          }
          try {
            onChange(JSON.parse(text));
            setError(null);
          } catch {
            setError(`${name}: invalid JSON — not saved to form state`);
          }
        }}
        spellCheck={false}
      />
      {error && <p className="mt-1 font-mono text-[11px] text-strike">{error}</p>}
    </label>
  );
}
