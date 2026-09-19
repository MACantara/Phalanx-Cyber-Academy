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
      <div className="flex min-h-screen items-center justify-center bg-stock font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">
        Loading simulation...
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-stock pb-8 text-ink">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-4 border-b border-hairline bg-stock px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <div>
          <span className="register">Plate — Defense Operations Console</span>
          <h1 className="mb-2 mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            <ShieldCheck className="mr-2 inline h-8 w-8 text-seal-ink" />
            Blue Team vs Red Team
          </h1>
          <p className="text-base text-ink-soft sm:text-lg">Defend Project Sentinel Academy against adaptive AI attacks</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex min-h-[44px] items-center bg-ink px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink">
            <Lightbulb className="mr-2 h-4 w-4" /> Quick Guide
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="inline-flex min-h-[44px] items-center border border-ink px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-stock-green"
            >
              <Settings className="mr-2 h-4 w-4" /> Controls
            </button>
            {showMenu && (
              <div className="absolute right-0 z-20 mt-2 w-52 border border-ink bg-stock">
                <button
                  onClick={() => { setPaused((p) => !p); setShowMenu(false); }}
                  className="flex min-h-[44px] w-full items-center px-4 py-2 text-left font-mono text-xs uppercase tracking-[0.12em] text-ink transition-colors hover:bg-stock-green"
                >
                  {paused ? <><Play className="mr-2 h-4 w-4 text-confirm" /> Resume</> : <><Pause className="mr-2 h-4 w-4 text-ink-soft" /> Pause Simulation</>}
                </button>
                <button
                  onClick={() => { handleReset(); setShowMenu(false); }}
                  className="flex min-h-[44px] w-full items-center px-4 py-2 text-left font-mono text-xs uppercase tracking-[0.12em] text-ink transition-colors hover:bg-stock-green"
                >
                  <RotateCcw className="mr-2 h-4 w-4 text-ink-soft" /> Reset Simulation
                </button>
                <div className="border-t border-hairline" />
                <button
                  onClick={() => { handleExit(); setShowMenu(false); }}
                  className="flex min-h-[44px] w-full items-center px-4 py-2 text-left font-mono text-xs uppercase tracking-[0.12em] text-strike transition-colors hover:bg-stock-green"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Exit to Menu
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Status Bar */}
      <div className="mx-5 mb-6 grid grid-cols-1 gap-4 border border-hairline bg-stock-drift p-4 sm:mx-8 md:grid-cols-5">
        <div className="flex items-center gap-3" title="Network security status">
          <div className={`h-3 w-3 ${health > 50 ? 'bg-confirm' : 'bg-strike'}`} />
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft">
            Network: <span className={health > 50 ? 'text-confirm' : 'text-strike'}>{health > 50 ? 'Secure' : 'Compromised'}</span>
          </span>
        </div>
        <div className="flex items-center gap-3" title="Asset integrity status">
          <div className={`h-3 w-3 ${health > 50 ? 'bg-confirm' : 'bg-strike'}`} />
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft">
            Assets: <span className={health > 50 ? 'text-confirm' : 'text-strike'}>{health > 50 ? 'Protected' : 'At Risk'}</span>
          </span>
        </div>
        <div className="flex items-center gap-3" title="Active security alerts">
          <AlertTriangle className="h-4 w-4 text-ink-soft" />
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft">
            Alerts: <span className={activeAlertCount > 0 ? 'text-strike' : 'text-ink'}>{activeAlertCount} Active</span>
          </span>
        </div>
        <div className="flex items-center gap-3" title="Experience points earned this session">
          <Award className="h-4 w-4 text-seal-ink" />
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft">
            Session XP: <span className="text-seal-ink">{score.blue}</span>
          </span>
        </div>
        <div className="flex items-center gap-3" title="Time remaining in simulation">
          <Clock className="h-4 w-4 text-ink-soft" />
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft">
            Time: <span className="text-ink">{formatTime(timeRemaining)}</span>
          </span>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="mx-5 space-y-6 sm:mx-8">
        {/* Tabs */}
        <div className="border border-ink bg-stock">
          <div className="flex border-b border-hairline">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-h-[44px] flex-1 px-2 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors hover:bg-stock-green sm:px-4 sm:text-xs ${
                    isActive
                      ? 'border-b-2 border-ink bg-stock-drift text-ink'
                      : 'border-b-2 border-transparent text-ink-soft'
                  }`}
                >
                  <Icon className="mr-2 inline h-4 w-4" /> {tab.label}
                  {tab.id === 'alerts' && activeAlertCount > 0 && (
                    <span className="ml-2 inline-flex items-center bg-strike px-1.5 py-0.5 font-mono text-[10px] text-stock">{activeAlertCount}</span>
                  )}
                  {tab.id === 'incidents' && incidentCount > 0 && (
                    <span className="ml-2 inline-flex items-center bg-seal px-1.5 py-0.5 font-mono text-[10px] text-seal-ink">{incidentCount}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === 'network' && (
              <div>
                <h3 className="mb-4 flex items-center text-lg font-semibold text-ink">
                  <Activity className="mr-2 h-5 w-5 text-ink" /> Network Defense Map
                </h3>
                <div className="border border-hairline bg-stock-drift p-4 sm:p-6">
                  <div className="mb-6 flex flex-wrap items-center justify-center gap-6">
                    {assets.map((asset) => {
                      const Icon = asset.icon;
                      const integrity = gameState?.assets?.[asset.id]?.integrity ?? 100;
                      const statusColor = integrity > 60 ? 'border-confirm text-confirm' : integrity > 30 ? 'border-ink text-ink' : 'border-strike text-strike';
                      return (
                        <div
                          key={asset.id}
                          className={`w-40 cursor-pointer border-2 bg-stock p-4 text-center transition-colors hover:bg-stock-green ${statusColor.split(' ')[0]}`}
                        >
                          <Icon className={`mx-auto mb-2 h-6 w-6 ${statusColor.split(' ')[1]}`} />
                          <div className={`font-mono text-xs font-bold ${statusColor.split(' ')[1]}`}>{asset.name}</div>
                          <div className="mb-1 text-xs text-ink-soft">({asset.label})</div>
                          <div className="mt-2 h-1 w-full bg-hairline-soft">
                            <div
                              className={`h-1 ${integrity > 60 ? 'bg-confirm' : integrity > 30 ? 'bg-ink' : 'bg-strike'}`}
                              style={{ width: `${integrity}%` }}
                            />
                          </div>
                          <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">{integrity}% Integrity</div>
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
                          className={`flex min-h-[44px] items-center border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                            active ? 'border-confirm bg-stock text-ink' : 'border-hairline bg-stock text-ink-soft hover:bg-stock-green'
                          }`}
                        >
                          <Icon className={`mr-2 h-4 w-4 ${active ? 'text-confirm' : 'text-ink-soft'}`} />
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
                  <h3 className="flex items-center text-lg font-semibold text-ink">
                    <AlertTriangle className="mr-2 h-5 w-5 text-strike" /> Alert Center
                  </h3>
                  <button
                    onClick={markAllRead}
                    className="inline-flex min-h-[44px] items-center border border-ink px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-stock-green"
                  >
                    Mark All Read
                  </button>
                </div>
                <div className="mb-4 border-l-2 border-l-seal-ink bg-stock-drift p-3">
                  <p className="text-xs text-ink-soft">
                    <Lightbulb className="mr-1 inline h-4 w-4 text-seal-ink" />
                    <strong>Tip:</strong> New alerts appear here when the Red Team AI attacks. Click an alert to mark it as read. Use terminal commands to investigate and respond to threats.
                  </p>
                </div>
                <div className="space-y-3">
                  {alerts.length === 0 && <p className="text-sm italic text-ink-soft">No active alerts. Your network is currently secure.</p>}
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => setAlerts((prev) => prev.map((a) => (a.id === alert.id ? { ...a, read: true } : a)))}
                      className={`cursor-pointer border p-3 transition-colors hover:border-ink ${
                        alert.read ? 'border-hairline bg-stock opacity-60' : 'border-ink bg-stock-drift'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-mono text-[10px] font-bold uppercase tracking-[0.14em] ${alert.severity === 'high' ? 'text-strike' : alert.severity === 'medium' ? 'text-ink' : 'text-confirm'}`}>
                          {alert.severity}
                        </span>
                        <span className="font-mono text-xs text-ink-soft">{alert.time}</span>
                      </div>
                      <p className="text-sm text-ink">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'incidents' && (
              <div>
                <h3 className="mb-4 flex items-center text-lg font-semibold text-ink">
                  <ShieldAlert className="mr-2 h-5 w-5 text-strike" /> Incident Response
                </h3>
                <div className="mb-4 border-l-2 border-l-strike bg-stock-drift p-3">
                  <p className="text-xs text-ink-soft">
                    <AlertTriangle className="mr-1 inline h-4 w-4 text-strike" />
                    <strong>About Incidents:</strong> Critical attacks that need immediate action appear here. These represent successful breaches or compromised assets that require terminal commands to resolve.
                  </p>
                </div>
                <p className="text-sm italic text-ink-soft">No incidents detected. All systems operating normally.</p>
              </div>
            )}
          </div>
        </div>

        {/* Terminal */}
        <div className="border border-ink bg-stock">
          <div className="flex flex-col gap-3 border-b border-hairline px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="flex items-center text-lg font-semibold text-ink">
              <Terminal className="mr-2 h-5 w-5 text-ink" /> Defense Command Terminal
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center text-xs text-ink-soft">
                Type <span className="mx-1 font-mono font-semibold text-ink">help</span> for commands
              </div>
              <button
                onClick={clearTerminal}
                className="inline-flex min-h-[44px] items-center border border-ink px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-stock-green"
              >
                <Trash className="mr-1 inline h-3 w-3" /> Clear
              </button>
            </div>
          </div>

          <div className="bg-stock-drift p-4 font-mono text-sm text-ink" style={{ minHeight: '300px', maxHeight: '400px', overflowY: 'auto' }}>
            {terminalOutput.map((line, i) => (
              <div key={i} className="mb-1">
                {line.startsWith('$') ? <span className="text-ink">{line}</span> : <span className="text-ink-soft">{line}</span>}
              </div>
            ))}
          </div>

          <div className="border-t border-hairline bg-stock px-4 py-3">
            <form onSubmit={handleCommand} className="mb-2 flex items-center gap-2">
              <span className="select-none font-mono text-base font-bold text-ink">$</span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                className="min-h-[44px] flex-1 border border-hairline bg-stock px-3 py-2 font-mono text-base text-ink transition-colors focus:border-seal-ink focus:outline-2 focus:outline-seal-ink"
                placeholder="Type a command and press Enter..."
                autoComplete="off"
                spellCheck={false}
              />
            </form>
            <div className="flex flex-col justify-between text-xs text-ink-soft sm:flex-row">
              <div>
                <Lightbulb className="mr-1 inline h-3 w-3 text-seal-ink" />
                Quick: <span className="font-mono text-ink">scan academy-server</span>, <span className="font-mono text-ink">status</span>, <span className="font-mono text-ink">restore student-db</span>
              </div>
              <div>
                <span className="text-ink-soft">Press Enter to execute</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating action helpers */}
      <div className="mx-5 mt-6 grid grid-cols-1 gap-4 sm:mx-8 md:grid-cols-2">
        <button
          onClick={handleDefend}
          className="flex min-h-[44px] items-center justify-center bg-ink px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink"
        >
          <Shield className="mr-2 h-5 w-5" /> Defend
        </button>
        <button
          onClick={handleAttack}
          className="flex min-h-[44px] items-center justify-center border-2 border-strike px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-strike transition-colors hover:bg-stock-green"
        >
          <Zap className="mr-2 h-5 w-5" /> Simulate Attack
        </button>
      </div>

      {/* Results overlay */}
      {results && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-5">
          <div className="plate plate-strong reg-corners w-full max-w-md p-5 text-center sm:p-8">
            <span className="register">Session Report</span>
            <h2 className="mb-2 mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">Simulation Complete</h2>
            <p className="mb-6 text-ink-soft">Final score: <span className="font-mono font-bold text-confirm">{results.final_score ?? 0}</span></p>
            <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
              <div className="border border-hairline bg-stock-drift p-3">
                <p className="register">Completion Bonus</p>
                <p className="mt-1 font-mono text-xl font-bold text-ink">{results.completion_bonus ?? 0}</p>
              </div>
              <div className="border border-hairline bg-stock-drift p-3">
                <p className="register">XP Awarded</p>
                <p className="mt-1 font-mono text-xl font-bold text-seal-ink">{results.xp_awarded ?? 0}</p>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={handleReset}
                className="inline-flex min-h-[44px] items-center justify-center bg-ink px-6 py-2 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink"
              >
                Play Again
              </button>
              <button
                onClick={handleExit}
                className="inline-flex min-h-[44px] items-center justify-center border border-ink px-6 py-2 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-stock-green"
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
