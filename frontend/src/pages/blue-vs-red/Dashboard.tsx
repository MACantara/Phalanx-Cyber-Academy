import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import {
  Shield,
  Zap,
  AlertTriangle,
  Activity,
  Pause,
  Play,
  RotateCcw,
  Server,
  Database,
  FileText,
  BookOpen,
  ShieldCheck,
  Laptop,
  Key,
  Settings,
  Terminal,
  Trash,
  Lightbulb,
  ShieldAlert,
  Award,
  Clock,
  LogOut,
} from 'lucide-react';

interface Alert {
  id: number;
  severity: 'high' | 'medium' | 'low';
  message: string;
  time: string;
  read: boolean;
}

interface Asset {
  id: string;
  icon: typeof Server;
  name: string;
  label: string;
  integrity: number;
}

const assets: Asset[] = [
  { id: 'academy-server', icon: Server, name: 'academy-server', label: 'Academy Server', integrity: 100 },
  { id: 'student-db', icon: Database, name: 'student-db', label: 'Student DB', integrity: 100 },
  { id: 'research-files', icon: FileText, name: 'research-files', label: 'Research Files', integrity: 100 },
  { id: 'learning-platform', icon: BookOpen, name: 'learning-platform', label: 'Learning Platform', integrity: 100 },
];

const tabs = [
  { id: 'network', label: 'Network Defense Map', icon: Activity },
  { id: 'alerts', label: 'Alert Center', icon: AlertTriangle },
  { id: 'incidents', label: 'Incident Response', icon: ShieldAlert },
] as const;

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]['id']>('network');
  const [score, setScore] = useState({ blue: 0, red: 0 });
  const [health, setHealth] = useState(100);
  const [paused, setPaused] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [controls, setControls] = useState({ firewall: true, endpoint: true, access: true });
  const [gameState, setGameState] = useState<Record<string, any> | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(900);
  const [showMenu, setShowMenu] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    'Defense Command Terminal v1.0',
    'Type "help" for available commands',
  ]);
  const [results, setResults] = useState<Record<string, any> | null>(null);

  const activeAlertCount = alerts.filter((a) => !a.read && a.severity !== 'low').length;
  const incidentCount = gameState?.incidents?.length ?? 0;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const buildSecurityControls = (ctrls: typeof controls) => ({
    firewall: { active: ctrls.firewall, effectiveness: 80 },
    endpoint: { active: ctrls.endpoint, effectiveness: 75 },
    access: { active: ctrls.access, effectiveness: 85 },
  });

  const applyState = (data: Record<string, any>) => {
    setGameState(data);
    setScore({ blue: data.sessionXP ?? 0, red: (data.attacksSuccessful ?? 0) * 10 });

    const assetValues = data.assets ? Object.values(data.assets) : [];
    const avgIntegrity = assetValues.length
      ? Math.round(
          assetValues.reduce(
            (sum: number, a: any) => sum + (a?.integrity ?? 100),
            0
          ) / assetValues.length
        )
      : 100;
    setHealth(avgIntegrity);

    setAlerts(data.alerts ?? []);
    setControls({
      firewall: data.securityControls?.firewall?.active ?? true,
      endpoint: data.securityControls?.endpoint?.active ?? true,
      access: data.securityControls?.access?.active ?? true,
    });
    setTimeRemaining(data.timeRemaining ?? 900);
  };

  const fetchState = async () => {
    const { data } = await api.get('/blue-vs-red/game-state');
    applyState(data);
  };

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        await api.post('/blue-vs-red/start-game');
        const { data } = await api.get('/blue-vs-red/game-state');
        if (mounted) applyState(data);
      } catch (e) {
        console.error('Failed to initialize BvR game state', e);
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (paused || !gameState?.isRunning || results) return;
    const timer = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleStop();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [paused, gameState?.isRunning, results]);

  useEffect(() => {
    if (paused || !gameState?.isRunning || results) return;
    const attacks = setInterval(() => {
      runAiAttack();
    }, 5000);
    return () => clearInterval(attacks);
  }, [paused, gameState?.isRunning, results]);

  const runAiAttack = async () => {
    const targets = Object.keys(gameState?.assets ?? {});
    const target = targets.length ? targets[Math.floor(Math.random() * targets.length)] : 'academy-server';
    const severities = ['low', 'medium', 'high', 'critical'];
    const severity = severities[Math.floor(Math.random() * severities.length)] as string;
    const actionTypes = ['port-scan', 'brute-force', 'sql-injection', 'phishing', 'malware'];
    const action = actionTypes[Math.floor(Math.random() * actionTypes.length)];
    const octet = Math.floor(Math.random() * 254) + 1;
    try {
      await api.post('/blue-vs-red/ai-action', {
        action,
        severity,
        target,
        successful: true,
        detected: true,
        sourceIP: `10.0.0.${octet}`,
      });
      await fetchState();
    } catch (e) {
      // Ignore race with stopped game
    }
  };

  const handleStop = async () => {
    try {
      const { data } = await api.post('/blue-vs-red/stop-game');
      if (data) {
        setResults(data);
        if (data.gameState) applyState(data.gameState);
      }
    } catch (e) {
      console.error('Failed to stop BvR game', e);
    }
  };

  const handleDefend = async () => {
    if (paused) return;
    await api.post('/blue-vs-red/player-action', {
      action: 'block-ip',
      target: '10.0.0.12',
      successful: true,
      effectiveness: 80,
    });
    await fetchState();
  };

  const handleAttack = async () => {
    if (paused) return;
    await api.post('/blue-vs-red/ai-action', {
      action: 'attack',
      severity: 'high',
      target: 'academy-server',
      successful: true,
      sourceIP: '10.0.0.99',
    });
    await fetchState();
  };

  const markAllRead = async () => {
    const updated = alerts.map((a) => ({ ...a, read: true }));
    setAlerts(updated);
    await api.post('/blue-vs-red/game-state', {
      state: { alerts: updated },
    });
  };

  const clearTerminal = () => setTerminalOutput(['Terminal cleared.']);

  const toggleControl = async (key: keyof typeof controls) => {
    const next = { ...controls, [key]: !controls[key] };
    setControls(next);
    await api.post('/blue-vs-red/game-state', {
      state: { securityControls: buildSecurityControls(next) },
    });
  };

  const handleReset = async () => {
    await api.post('/blue-vs-red/reset-game');
    await api.post('/blue-vs-red/start-game');
    const { data } = await api.get('/blue-vs-red/game-state');
    setResults(null);
    applyState(data);
  };

  const handleExit = async () => {
    try {
      await api.post('/blue-vs-red/exit-game');
    } finally {
      navigate('/blue-vs-red');
    }
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.trim().toLowerCase();
    let response = `Unknown command: "${terminalInput}"`;
    if (cmd === 'help') response = 'Available commands: help, status, clear, defend, attack';
    if (cmd === 'status') response = `Network health: ${health}% | Blue score: ${score.blue} | Red score: ${score.red}`;
    if (cmd === 'defend') {
      await handleDefend();
      response = 'Defense action executed.';
    }
    if (cmd === 'attack') {
      await handleAttack();
      response = 'Attack simulation logged.';
    }
    if (cmd === 'clear') {
      clearTerminal();
      setTerminalInput('');
      return;
    }
    setTerminalOutput((prev) => [...prev, `$ ${terminalInput}`, response]);
    setTerminalInput('');
  };

  if (!gameState) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        Loading simulation...
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-black text-gray-100">
      {/* Header */}
      <header className="mb-6 flex items-start justify-between border-b border-gray-600 bg-gray-800 p-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">
            <ShieldCheck className="mr-2 inline h-8 w-8 text-green-400" />
            Blue Team vs Red Team
          </h1>
          <p className="text-lg text-gray-300">Defend Project Sentinel Academy against adaptive AI attacks</p>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center rounded-lg border border-blue-500 bg-blue-600 px-4 py-2 text-sm text-white shadow-sm transition-colors hover:bg-blue-700">
            <Lightbulb className="mr-2 h-4 w-4" /> Quick Guide
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="flex items-center rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm text-white shadow-sm transition-colors hover:bg-gray-600"
            >
              <Settings className="mr-2 h-4 w-4 text-gray-300" /> Controls
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-600 bg-gray-800 shadow-lg">
                <button
                  onClick={() => { setPaused((p) => !p); setShowMenu(false); }}
                  className="flex w-full items-center px-4 py-2 text-left text-sm text-white hover:bg-gray-700"
                >
                  {paused ? <><Play className="mr-2 h-4 w-4 text-green-400" /> Resume</> : <><Pause className="mr-2 h-4 w-4 text-yellow-400" /> Pause Simulation</>}
                </button>
                <button
                  onClick={() => { handleReset(); setShowMenu(false); }}
                  className="flex w-full items-center px-4 py-2 text-left text-sm text-white hover:bg-gray-700"
                >
                  <RotateCcw className="mr-2 h-4 w-4 text-gray-300" /> Reset Simulation
                </button>
                <div className="my-2 border-t border-gray-600" />
                <button
                  onClick={() => { handleExit(); setShowMenu(false); }}
                  className="flex w-full items-center px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Exit to Menu
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Status Bar */}
      <div className="mx-4 mb-6 grid grid-cols-1 gap-4 rounded-lg border border-gray-600 bg-gray-800 p-4 md:grid-cols-5">
        <div className="flex items-center space-x-3" title="Network security status">
          <div className={`h-4 w-4 animate-pulse rounded-full ${health > 50 ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-sm font-medium text-white">
            Network: <span className={health > 50 ? 'text-green-400' : 'text-red-400'}>{health > 50 ? 'Secure' : 'Compromised'}</span>
          </span>
        </div>
        <div className="flex items-center space-x-3" title="Asset integrity status">
          <div className={`h-4 w-4 rounded-full ${health > 50 ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-sm font-medium text-white">
            Assets: <span className={health > 50 ? 'text-green-400' : 'text-red-400'}>{health > 50 ? 'Protected' : 'At Risk'}</span>
          </span>
        </div>
        <div className="flex items-center space-x-3" title="Active security alerts">
          <AlertTriangle className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-white">
            Alerts: <span className={activeAlertCount > 0 ? 'text-red-400' : 'text-gray-300'}>{activeAlertCount} Active</span>
          </span>
        </div>
        <div className="flex items-center space-x-3" title="Experience points earned this session">
          <Award className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-white">
            Session XP: <span className="text-blue-400">{score.blue}</span>
          </span>
        </div>
        <div className="flex items-center space-x-3" title="Time remaining in simulation">
          <Clock className="h-4 w-4 text-green-400" />
          <span className="text-sm font-medium text-white">
            Time: <span className="text-green-400">{formatTime(timeRemaining)}</span>
          </span>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="mx-4 space-y-6">
        {/* Tabs */}
        <div className="border border-gray-600 bg-gray-800">
          <div className="flex border-b border-gray-600">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-3 text-sm font-semibold transition-all hover:bg-gray-700 ${
                    isActive
                      ? 'border-b-2 border-green-400 bg-green-500/10 text-white'
                      : 'border-b-2 border-transparent text-gray-400'
                  }`}
                >
                  <Icon className="mr-2 inline h-4 w-4" /> {tab.label}
                  {tab.id === 'alerts' && activeAlertCount > 0 && (
                    <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white animate-pulse">{activeAlertCount}</span>
                  )}
                  {tab.id === 'incidents' && incidentCount > 0 && (
                    <span className="ml-2 rounded-full bg-yellow-500 px-2 py-0.5 text-xs text-black">{incidentCount}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === 'network' && (
              <div>
                <h3 className="mb-4 flex items-center text-lg font-semibold text-white">
                  <Activity className="mr-2 h-5 w-5 text-green-400" /> Network Defense Map
                </h3>
                <div className="border border-gray-600 bg-black p-6">
                  <div className="mb-6 flex flex-wrap items-center justify-center gap-6">
                    {assets.map((asset) => {
                      const Icon = asset.icon;
                      const integrity = gameState?.assets?.[asset.id]?.integrity ?? 100;
                      const statusColor = integrity > 60 ? 'border-green-400 text-green-400' : integrity > 30 ? 'border-yellow-400 text-yellow-400' : 'border-red-400 text-red-400';
                      return (
                        <div
                          key={asset.id}
                          className="w-40 cursor-pointer rounded-lg border-2 bg-gray-700 p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:bg-gray-600 hover:shadow-lg"
                        >
                          <Icon className={`mx-auto mb-2 h-6 w-6 ${statusColor.split(' ')[1]}`} />
                          <div className={`text-xs font-mono font-bold ${statusColor.split(' ')[1]}`}>{asset.name}</div>
                          <div className="mb-1 text-xs text-gray-400">({asset.label})</div>
                          <div className="mt-2 h-1 w-full rounded bg-gray-600">
                            <div
                              className={`h-1 rounded ${integrity > 60 ? 'bg-green-400' : integrity > 30 ? 'bg-yellow-400' : 'bg-red-400'}`}
                              style={{ width: `${integrity}%` }}
                            />
                          </div>
                          <div className="mt-1 text-xs text-gray-300">{integrity}% Integrity</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4">
                    {[
                      { key: 'firewall', icon: ShieldCheck, label: 'Firewall' },
                      { key: 'endpoint', icon: Laptop, label: 'Endpoint Protection' },
                      { key: 'access', icon: Key, label: 'Access Control' },
                    ].map((control) => {
                      const Icon = control.icon;
                      const active = controls[control.key as keyof typeof controls];
                      return (
                        <button
                          key={control.key}
                          onClick={() => toggleControl(control.key as keyof typeof controls)}
                          className={`flex items-center rounded border px-3 py-2 text-xs text-white transition-all hover:scale-105 ${
                            active ? 'border-green-400 bg-gray-700 shadow-md' : 'border-gray-600 bg-gray-800'
                          }`}
                        >
                          <Icon className={`mr-2 h-4 w-4 ${active ? 'text-green-400' : 'text-gray-400'}`} />
                          {control.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'alerts' && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center text-lg font-semibold text-white">
                    <AlertTriangle className="mr-2 h-5 w-5 text-orange-400" /> Alert Center
                  </h3>
                  <button
                    onClick={markAllRead}
                    className="rounded bg-blue-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-blue-700"
                  >
                    Mark All Read
                  </button>
                </div>
                <div className="mb-4 rounded-lg border border-blue-500/30 bg-blue-900/20 p-3">
                  <p className="text-xs text-blue-200">
                    <Lightbulb className="mr-1 inline h-4 w-4 text-yellow-400" />
                    <strong>Tip:</strong> New alerts appear here when the Red Team AI attacks. Click an alert to mark it as read. Use terminal commands to investigate and respond to threats.
                  </p>
                </div>
                <div className="space-y-3">
                  {alerts.length === 0 && <p className="text-sm text-gray-400 italic">No active alerts. Your network is currently secure.</p>}
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => setAlerts((prev) => prev.map((a) => (a.id === alert.id ? { ...a, read: true } : a)))}
                      className={`cursor-pointer rounded border p-3 transition-colors hover:bg-slate-700 ${
                        alert.read ? 'border-gray-600 bg-slate-900' : 'border-slate-600 bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold uppercase ${alert.severity === 'high' ? 'text-red-400' : alert.severity === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                          {alert.severity}
                        </span>
                        <span className="text-xs text-slate-500">{alert.time}</span>
                      </div>
                      <p className="text-sm text-slate-300">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'incidents' && (
              <div>
                <h3 className="mb-4 flex items-center text-lg font-semibold text-white">
                  <ShieldAlert className="mr-2 h-5 w-5 text-yellow-400" /> Incident Response
                </h3>
                <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-900/20 p-3">
                  <p className="text-xs text-yellow-200">
                    <AlertTriangle className="mr-1 inline h-4 w-4 text-yellow-400" />
                    <strong>About Incidents:</strong> Critical attacks that need immediate action appear here. These represent successful breaches or compromised assets that require terminal commands to resolve.
                  </p>
                </div>
                <p className="text-sm text-gray-400 italic">No incidents detected. All systems operating normally.</p>
              </div>
            )}
          </div>
        </div>

        {/* Terminal */}
        <div className="border border-gray-600 bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-600 px-4 py-3">
            <h3 className="flex items-center text-lg font-semibold text-white">
              <Terminal className="mr-2 h-5 w-5 text-green-400" /> Defense Command Terminal
            </h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-xs text-gray-400">
                Type <span className="mx-1 font-mono font-semibold text-green-400">help</span> for commands
              </div>
              <button
                onClick={clearTerminal}
                className="rounded border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:bg-gray-600 hover:text-white"
              >
                <Trash className="mr-1 inline h-3 w-3" /> Clear
              </button>
            </div>
          </div>

          <div className="bg-black p-4 font-mono text-sm text-green-400" style={{ minHeight: '300px', maxHeight: '400px', overflowY: 'auto' }}>
            {terminalOutput.map((line, i) => (
              <div key={i} className="mb-1">
                {line.startsWith('$') ? <span className="text-green-400">{line}</span> : <span className="text-slate-300">{line}</span>}
              </div>
            ))}
          </div>

          <div className="border-t border-gray-600 bg-gray-700/50 px-4 py-3">
            <form onSubmit={handleCommand} className="mb-2 flex items-center space-x-2">
              <span className="select-none text-lg font-bold text-green-400">$</span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                className="flex-1 rounded border border-gray-600 bg-gray-900 px-3 py-2 font-mono text-base text-green-400 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
                placeholder="Type a command and press Enter..."
                autoComplete="off"
                spellCheck={false}
              />
            </form>
            <div className="flex flex-col justify-between text-xs text-gray-400 sm:flex-row">
              <div>
                <Lightbulb className="mr-1 inline h-3 w-3 text-yellow-400" />
                Quick: <span className="font-mono text-green-400">scan academy-server</span>, <span className="font-mono text-green-400">status</span>, <span className="font-mono text-green-400">restore student-db</span>
              </div>
              <div>
                <span className="text-gray-500">Press Enter to execute</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating action helpers */}
      <div className="mx-4 mt-6 grid grid-cols-1 gap-4 pb-8 md:grid-cols-2">
        <button
          onClick={handleDefend}
          className="flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-all hover:bg-blue-700"
        >
          <Shield className="mr-2 h-5 w-5" /> Defend
        </button>
        <button
          onClick={handleAttack}
          className="flex items-center justify-center rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition-all hover:bg-red-700"
        >
          <Zap className="mr-2 h-5 w-5" /> Simulate Attack
        </button>
      </div>

      {/* Results overlay */}
      {results && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-600 bg-slate-900 p-6 text-center shadow-2xl">
            <h2 className="mb-2 text-3xl font-bold text-white">Simulation Complete</h2>
            <p className="mb-6 text-slate-300">Final score: <span className="font-bold text-green-400">{results.final_score ?? 0}</span></p>
            <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                <p className="text-slate-400">Completion Bonus</p>
                <p className="text-xl font-bold text-purple-400">{results.completion_bonus ?? 0}</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                <p className="text-slate-400">XP Awarded</p>
                <p className="text-xl font-bold text-blue-400">{results.xp_awarded ?? 0}</p>
              </div>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleReset}
                className="rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Play Again
              </button>
              <button
                onClick={handleExit}
                className="rounded-xl bg-slate-700 px-5 py-2 font-semibold text-white transition-colors hover:bg-slate-600"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
