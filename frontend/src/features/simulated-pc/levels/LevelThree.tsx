import { useState } from 'react';
import { useSimulatedPC } from '../context/SimulatedPCContext';

interface ProcessInfo {
  name: string;
  executable?: string;
  cpu?: number;
  memory?: number;
  priority?: string;
  category?: string;
  description?: string;
  trusted: boolean;
  isFalsePositive?: boolean;
  malwareType?: string;
  riskFactors?: string[];
  reputationDamage?: number;
  financialDamage?: number;
}

interface MalwareEntry {
  id: string;
  name: string;
  filename: string;
  type: string;
  riskLevel: string;
  size: string;
  path: string;
  description: string;
  signatures: string[];
  behavior: string[];
  origin: string;
  reputationDamage: number;
  financialDamage: number;
  scanTime: number;
  removalTime: number;
}

const fallbackProcesses: ProcessInfo[] = [
  { name: 'svchost.exe', trusted: true, description: 'Core Windows process' },
  { name: 'miner_bitcoin.exe', trusted: false, description: 'Cryptocurrency miner', malwareType: 'Miner' },
  { name: 'chrome.exe', trusted: true, description: 'Chrome browser' },
  { name: 'malware_dropper.exe', trusted: false, description: 'Malware dropper', malwareType: 'Trojan' },
  { name: 'explorer.exe', trusted: true, description: 'Windows Explorer' },
];

const fallbackMalware: MalwareEntry[] = [
  {
    id: 'miner',
    name: 'Bitcoin Miner',
    filename: 'miner_bitcoin.exe',
    type: 'Miner',
    riskLevel: 'High',
    size: '2.1 MB',
    path: 'C:\\Temp\\miner_bitcoin.exe',
    description: 'Uses your CPU to mine cryptocurrency without permission.',
    signatures: ['High CPU usage', 'Unknown publisher'],
    behavior: ['Uses CPU without permission', 'Slows down the computer'],
    origin: 'Unknown',
    reputationDamage: 25,
    financialDamage: 1000,
    scanTime: 2000,
    removalTime: 3000,
  },
];

const tabs = ['processes', 'scanner', 'logs'] as const;

export function LevelThree() {
  const { completeSession, content } = useSimulatedPC();
  const [tab, setTab] = useState<(typeof tabs)[number]>('processes');
  const [finished, setFinished] = useState(false);
  const [killed, setKilled] = useState<string[]>([]);
  const [scanned, setScanned] = useState<Record<string, boolean>>({});
  const [scanning, setScanning] = useState<Record<string, boolean>>({});
  const [quarantined, setQuarantined] = useState<string[]>([]);
  const [quarantining, setQuarantining] = useState<Record<string, boolean>>({});

  const processGroups = (content?.data?.processes as { system?: ProcessInfo[]; legitimate?: ProcessInfo[]; malware?: ProcessInfo[] } | undefined) ?? {};
  const allProcesses: ProcessInfo[] = [
    ...(processGroups.system ?? []),
    ...(processGroups.legitimate ?? []),
    ...(processGroups.malware ?? []),
  ];
  const processes = allProcesses.length > 0 ? allProcesses : fallbackProcesses;

  const rawMalware = (content?.data?.malware as Record<string, unknown> | undefined) ?? {};
  const malwareEntries: MalwareEntry[] = Object.values(rawMalware).length > 0
    ? (Object.values(rawMalware) as MalwareEntry[])
    : fallbackMalware;

  const score = Math.max(
    0,
    Math.round(
      (processes.filter((p) => (p.trusted ? !killed.includes(p.name) : killed.includes(p.name))).length /
        processes.length) *
        100,
    ),
  );

  const toggleProcess = (name: string) => {
    setKilled((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  };

  const systemLogs = processes.map((p) => ({
    name: p.name,
    time: new Date().toLocaleTimeString(),
    event: p.trusted ? `Process ${p.name} running normally` : `Suspicious activity detected in ${p.name}`,
  }));

  return (
    <div className="mx-auto max-w-4xl rounded border border-gray-600 bg-gray-800 p-6 text-white shadow-2xl">
      <h2 className="text-xl font-bold text-green-400">Malware Mayhem</h2>
      <p className="mt-2 text-sm text-gray-300">Investigate processes, scan for malware, and review system logs.</p>

      <div className="mt-4 flex gap-2 border-b border-gray-600 pb-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-t px-4 py-2 text-sm font-semibold capitalize ${
              tab === t ? 'bg-gray-700 text-green-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'processes' && (
        <div className="mt-4">
          <p className="mb-2 text-sm text-gray-300">Select the malicious processes to terminate.</p>
          <div className="space-y-2">
            {processes.map((p) => (
              <div
                key={p.name}
                onClick={() => toggleProcess(p.name)}
                className={`flex cursor-pointer items-center justify-between rounded border px-4 py-2 ${
                  killed.includes(p.name) ? 'border-red-500 bg-red-900/30' : 'border-gray-600 bg-gray-700'
                }`}
              >
                <span className="font-mono">{p.name}</span>
                <span className="text-xs">{killed.includes(p.name) ? 'TERMINATED' : 'RUNNING'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'scanner' && (
        <div className="mt-4">
          <p className="mb-2 text-sm text-gray-300">Review detected malware and quarantine threats.</p>
          <div className="space-y-3">
            {malwareEntries.map((m) => (
              <div key={m.id} className="rounded border border-gray-600 bg-gray-700 p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.path ?? m.filename}</p>
                    <p className="text-sm text-red-300">{m.riskLevel}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (scanned[m.id]) {
                        setScanned((prev) => ({ ...prev, [m.id]: false }));
                        return;
                      }
                      if (scanning[m.id]) return;
                      setScanning((prev) => ({ ...prev, [m.id]: true }));
                      setTimeout(() => {
                        setScanned((prev) => ({ ...prev, [m.id]: true }));
                        setScanning((prev) => ({ ...prev, [m.id]: false }));
                      }, m.scanTime || 2000);
                    }}
                    disabled={scanning[m.id]}
                    className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {scanning[m.id] ? 'Scanning...' : scanned[m.id] ? 'Hide Scan' : 'Scan'}
                  </button>
                </div>
                {scanned[m.id] && (
                  <div className="mt-2 border-t border-gray-600 pt-2 text-sm text-gray-300">
                    <p className="font-semibold">Description</p>
                    <p className="mb-2">{m.description}</p>
                    <p className="font-semibold">Signatures</p>
                    <ul className="mb-2 list-disc space-y-0.5 pl-4 text-xs">
                      {m.signatures.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                    <button
                      onClick={() => {
                        if (quarantined.includes(m.id)) {
                          setQuarantined((prev) => prev.filter((id) => id !== m.id));
                          return;
                        }
                        if (quarantining[m.id]) return;
                        setQuarantining((prev) => ({ ...prev, [m.id]: true }));
                        setTimeout(() => {
                          setQuarantined((prev) => [...prev, m.id]);
                          setQuarantining((prev) => ({ ...prev, [m.id]: false }));
                        }, m.removalTime || 3000);
                      }}
                      disabled={quarantining[m.id]}
                      className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {quarantining[m.id] ? 'Quarantining...' : quarantined.includes(m.id) ? 'Restored' : 'Quarantine'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'logs' && (
        <div className="mt-4">
          <p className="mb-2 text-sm text-gray-300">Recent system events:</p>
          <div className="h-64 overflow-auto rounded border border-gray-600 bg-black p-3 font-mono text-xs text-green-400">
            {systemLogs.map((log, i) => (
              <div key={i} className="mb-1">
                <span className="text-gray-500">[{log.time}]</span> {log.event}
              </div>
            ))}
          </div>
        </div>
      )}

      {!finished ? (
        <button
          onClick={() => setFinished(true)}
          className="mt-6 rounded bg-green-500 px-6 py-2 font-bold text-black hover:bg-green-400"
        >
          Submit
        </button>
      ) : (
        <div className="mt-6">
          <p className="text-lg">
            Score: <span className="font-bold text-green-400">{score}%</span>
          </p>
          <button
            onClick={() => completeSession(score)}
            className="mt-4 rounded bg-green-500 px-6 py-2 font-bold text-black hover:bg-green-400"
          >
            Finish &amp; Exit
          </button>
        </div>
      )}
    </div>
  );
}
