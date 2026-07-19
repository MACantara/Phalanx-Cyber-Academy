import { useState } from 'react';
import { useSimulatedPC } from '../context/SimulatedPCContext';

interface EvidenceItem {
  id: string;
  type: string;
  source: string;
  title: string;
  description: string;
  difficulty: string;
  clue_type: string;
  finding: string;
  evidence_data?: Record<string, unknown>;
}

interface NullMember {
  id: string;
  code_name?: string;
  real_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  nationality?: string;
  personality?: string;
  evidence_trail?: EvidenceItem[];
}

interface MembersData {
  null_members?: NullMember[];
  investigation_metadata?: { case_title?: string; case_description?: string };
}

function RenderData({ data }: { data: unknown }) {
  if (data === null || data === undefined) return null;
  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
    return <span>{String(data)}</span>;
  }
  if (Array.isArray(data)) {
    return (
      <ul className="list-disc space-y-0.5 pl-4">
        {data.map((item, idx) => (
          <li key={idx}>
            <RenderData data={item} />
          </li>
        ))}
      </ul>
    );
  }
  if (typeof data === 'object') {
    return (
      <ul className="space-y-0.5 text-sm">
        {Object.entries(data as Record<string, unknown>).map(([key, value]) => (
          <li key={key}>
            <span className="font-semibold capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
            <RenderData data={value} />
          </li>
        ))}
      </ul>
    );
  }
  return null;
}

export function LevelFive() {
  const { completeSession, content } = useSimulatedPC();
  const data = (content?.data?.members as MembersData | undefined) ?? {};
  const members = data.null_members ?? [];
  const title = data.investigation_metadata?.case_title ?? 'The Hunt for The Null';
  const description = data.investigation_metadata?.case_description ?? 'Review the evidence and identify every member of The Null network.';

  const [selected, setSelected] = useState<string[]>([]);
  const [activeMember, setActiveMember] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [viewReport, setViewReport] = useState(false);

  const allIds = members.map((m) => m.id);
  const correct = selected.filter((id) => allIds.includes(id)).length;
  const score = Math.round((correct / Math.max(1, allIds.length)) * 100);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = () => {
    setFinished(true);
    completeSession(score);
  };

  const generateReport = () => {
    const lines = [
      'PHALANX CYBER ACADEMY - FORENSIC INVESTIGATION REPORT',
      `Case: ${title}`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'Synopsis:',
      description,
      '',
      'Suspects Investigated:',
      ...members.map((m) => {
        const identified = selected.includes(m.id) ? '[IDENTIFIED]' : '[NOT IDENTIFIED]';
        return `- ${identified} ${m.code_name ?? m.real_name ?? m.id} (${m.role ?? 'Unknown role'})`;
      }),
      '',
      'Evidence Summary:',
      ...members.flatMap((m) => [
        `* ${m.code_name ?? m.real_name ?? m.id}`,
        ...(m.evidence_trail ?? []).map((e) => `  - ${e.title} (${e.source}): ${e.finding}`),
      ]),
      '',
      'Conclusion:',
      `Score: ${score}% (${correct} of ${allIds.length} null members identified)`,
    ];
    return lines.join('\n');
  };

  const active = members.find((m) => m.id === activeMember);

  if (members.length === 0) {
    return (
      <div className="mx-auto max-w-3xl rounded border border-gray-600 bg-gray-800 p-6 text-white shadow-2xl">
        <h2 className="text-xl font-bold text-green-400">{title}</h2>
        <p className="mt-2 text-gray-300">No member data was found in the loaded level content.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl rounded border border-gray-600 bg-gray-800 p-6 text-white shadow-2xl">
      <h2 className="text-xl font-bold text-green-400">{title}</h2>
      <p className="mt-2 text-sm text-gray-300">{description}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 font-semibold">Suspects</h3>
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className={`cursor-pointer rounded border p-3 transition-colors ${
                  activeMember === member.id
                    ? 'border-blue-400 bg-gray-700'
                    : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => setActiveMember(member.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold">{member.code_name ?? member.real_name ?? member.id}</div>
                    <div className="text-xs text-gray-300">{member.role ?? 'Unknown role'}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(member.id);
                    }}
                    className={`rounded px-3 py-1 text-xs font-semibold text-black ${
                      selected.includes(member.id) ? 'bg-green-400 hover:bg-green-300' : 'bg-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {selected.includes(member.id) ? 'Identified' : 'Identify'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          {active ? (
            <div className="rounded border border-gray-600 bg-gray-700 p-4">
              <h3 className="text-lg font-bold text-green-400">{active.code_name ?? active.real_name}</h3>
              <p className="text-sm text-gray-300">{active.role}</p>
              {active.personality && (
                <p className="mt-2 text-sm italic text-gray-400">{active.personality}</p>
              )}
              {active.nationality && (
                <p className="mt-1 text-xs text-gray-400">Nationality: {active.nationality}</p>
              )}

              <h4 className="mb-2 mt-4 font-semibold text-gray-200">Evidence Trail</h4>
              <div className="max-h-96 overflow-auto space-y-3 pr-2">
                {(active.evidence_trail ?? []).map((item) => (
                  <div key={item.id} className="rounded border border-gray-600 bg-gray-800 p-3">
                    <p className="font-semibold text-blue-300">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.source} • {item.difficulty}</p>
                    <p className="mt-1 text-sm text-gray-300">{item.description}</p>
                    <p className="mt-2 text-sm font-semibold text-green-300">Finding: {item.finding}</p>
                    {item.evidence_data && (
                      <div className="mt-2 rounded bg-black/30 p-2 text-xs text-gray-300">
                        <RenderData data={item.evidence_data} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded border border-dashed border-gray-600 bg-gray-700/50 p-6 text-center text-gray-400">
              Select a suspect to view their evidence trail.
            </div>
          )}
        </div>
      </div>

      {!finished ? (
        <div className="mt-6 flex flex-wrap gap-4">
          <button
            onClick={() => setViewReport(true)}
            className="rounded bg-blue-500 px-6 py-2 font-bold text-black hover:bg-blue-400"
          >
            Preview Forensic Report
          </button>
          <button
            onClick={handleSubmit}
            className="rounded bg-green-500 px-6 py-2 font-bold text-black hover:bg-green-400"
          >
            Submit Investigation
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-lg">
            Score: <span className="font-bold text-green-400">{score}%</span>
          </p>
          <p className="mt-2 text-sm text-gray-300">Session ending...</p>
        </div>
      )}

      {viewReport && (
        <div className="mt-6 rounded border border-gray-600 bg-gray-900 p-4">
          <h3 className="mb-2 text-lg font-bold text-green-400">Forensic Report Preview</h3>
          <textarea
            readOnly
            value={generateReport()}
            className="h-64 w-full rounded border border-gray-600 bg-black p-3 font-mono text-xs text-green-300"
          />
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              onClick={() => navigator.clipboard.writeText(generateReport())}
              className="rounded bg-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-500"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={() => {
                const blob = new Blob([generateReport()], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `forensic_report_${Date.now()}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="rounded bg-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-500"
            >
              Download Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
