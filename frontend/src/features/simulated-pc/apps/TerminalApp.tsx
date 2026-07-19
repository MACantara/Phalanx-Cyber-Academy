import { useState, useRef, useEffect, useMemo } from 'react';
import { useSimulatedPC } from '../context/SimulatedPCContext';

interface FsNode {
  type: 'directory' | 'file';
  content?: string;
  contents?: Record<string, FsNode>;
  hidden?: boolean;
  size?: number;
  flag_ids?: string[];
}

interface CtfFlag {
  id: string;
  value: string;
  name: string;
  challenge_question: string;
  location?: string;
  hints?: string[];
}

const demoFs: FsNode = {
  type: 'directory',
  contents: {
    home: {
      type: 'directory',
      contents: {
        user: {
          type: 'directory',
          contents: {
            notes: {
              type: 'file',
              content: 'Welcome to the Phalanx ethical-hacking terminal. Use ls, cat, cd, find, and submit.',
            },
          },
        },
      },
    },
    etc: {
      type: 'directory',
      contents: {
        'motd': {
          type: 'file',
          content: 'PhalanxOS v1.0 — Authorized Use Only',
        },
      },
    },
  },
};

const demoFlags: Record<string, CtfFlag> = {};

function getRootFs(data: unknown): FsNode {
  const root = (data as { fileSystem?: { fileSystem?: FsNode } } | undefined)?.fileSystem?.fileSystem;
  return root ?? demoFs;
}

function getFlags(data: unknown): Record<string, CtfFlag> {
  const flags = (data as { flags?: { ctf_flags?: { flags?: Record<string, CtfFlag> } } } | undefined)?.flags?.ctf_flags
    ?.flags;
  return flags ?? demoFlags;
}

function normalizePath(cwd: string, target: string): string {
  if (target.startsWith('/')) return target.replace(/\/$/, '') || '/';
  const parts = (cwd === '/' ? [''] : cwd.split('/'));
  const segs = target.split('/').filter((s) => s !== '' && s !== '.');
  for (const seg of segs) {
    if (seg === '..') {
      if (parts.length > 1) parts.pop();
    } else {
      parts.push(seg);
    }
  }
  return parts.join('/') || '/';
}

function resolveNode(root: FsNode, path: string): { node: FsNode | null; name: string; parent: FsNode | null } {
  if (path === '/') return { node: root, name: '', parent: null };
  const parts = path.split('/').filter(Boolean);
  let current: FsNode | null = root;
  let parent: FsNode | null = null;
  for (let i = 0; i < parts.length; i++) {
    if (!current || current.type !== 'directory' || !current.contents) return { node: null, name: parts[i], parent: null };
    parent = current;
    current = current.contents[parts[i]] ?? null;
  }
  return { node: current, name: parts[parts.length - 1] ?? '', parent };
}

export function TerminalApp() {
  const { content, completeSession } = useSimulatedPC();
  const root = getRootFs(content?.data);
  const flags = getFlags(content?.data);

  const ctfFlags = (content?.data as { flags?: { ctf_flags?: { flags_per_session?: number; flags?: Record<string, CtfFlag> } } } | undefined)?.flags?.ctf_flags;
  const flagsPerSession = ctfFlags?.flags_per_session ?? 3;
  const sessionFlags = useMemo(() => {
    const all = Object.values(flags);
    const shuffled = [...all];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, flagsPerSession);
  }, [flags, flagsPerSession]);

  const [history, setHistory] = useState<string[]>([
    `PhalanxOS terminal ready.${sessionFlags.length ? ' Capture the flags and type exit when done.' : ''}`,
    "Type 'help' for available commands.",
  ]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState('/');
  const [submittedFlags, setSubmittedFlags] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [history]);

  const echo = (lines: string[]) => setHistory((prev) => [...prev, ...lines]);

  const runCommand = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    setHistory((prev) => [...prev, `researcher@phalanx:${cwd}$ ${trimmed}`]);

    const [cmd, ...args] = trimmed.split(/\s+/);
    const command = cmd.toLowerCase();

    switch (command) {
      case 'help': {
        echo([
          'Available commands:',
          '  help                 Show this message',
          '  pwd                  Print working directory',
          '  ls [-la] [path]      List directory contents',
          '  cd <path>            Change directory',
          '  cat <file>           Display file contents',
          '  find [path] [name]   Find files or flag strings',
          '  nmap <target>        Scan a network target',
          '  whoami               Current user',
          '  submit <flag>        Submit a captured flag',
          '  exit                 Finish and submit the CTF',
          '  clear                Clear terminal',
        ]);
        return;
      }
      case 'clear':
        setHistory([]);
        return;
      case 'pwd':
        echo([cwd]);
        return;
      case 'whoami':
        echo(['researcher']);
        return;
      case 'cd': {
        const target = args[0] ?? '~';
        const next = normalizePath(cwd, target);
        const { node } = resolveNode(root, next);
        if (!node || node.type !== 'directory') {
          echo([`bash: cd: ${target}: No such directory` ]);
          return;
        }
        setCwd(next);
        return;
      }
      case 'ls': {
        const showHidden = args.includes('-la') || args.includes('-a');
        const pathArg = args.find((a) => !a.startsWith('-')) ?? '.';
        const target = normalizePath(cwd, pathArg);
        const { node } = resolveNode(root, target);
        if (!node || node.type !== 'directory') {
          echo([`ls: cannot access '${pathArg}': No such directory` ]);
          return;
        }
        const entries = Object.entries(node.contents ?? {});
        const visible = showHidden ? entries : entries.filter(([, n]) => !n.hidden);
        if (visible.length === 0) {
          echo(['(empty directory)']);
          return;
        }
        echo(visible.map(([name, n]) => `${n.type === 'directory' ? 'd' : '-'} ${String(n.size ?? 0).padStart(6, ' ')} ${name}`));
        return;
      }
      case 'cat': {
        const pathArg = args[0];
        if (!pathArg) {
          echo(['cat: missing file operand']);
          return;
        }
        const target = normalizePath(cwd, pathArg);
        const { node } = resolveNode(root, target);
        if (!node || node.type !== 'file') {
          echo([`cat: ${pathArg}: No such file or directory` ]);
          return;
        }
        echo((node.content ?? '').split('\n'));
        return;
      }
      case 'find': {
        const query = args.find((a) => a.startsWith('WHT{')) || args[0];
        if (!query) {
          echo(['find: missing search term']);
          return;
        }
        const matches: string[] = [];
        const walk = (node: FsNode, path: string) => {
          if (node.type === 'file' && node.content?.includes(query)) {
            matches.push(path);
          }
          if (node.type === 'directory' && node.contents) {
            for (const [name, child] of Object.entries(node.contents)) {
              walk(child, `${path}/${name}`);
            }
          }
        };
        walk(root, '');
        echo(matches.length ? matches : [`find: '${query}' not found`]);
        return;
      }
      case 'nmap': {
        const target = args[0] ?? 'localhost';
        if (target === 'localhost' || target === '127.0.0.1') {
          echo([
            `Starting Nmap scan against ${target}...`,
            'Interesting ports on localhost (127.0.0.1):',
            '  22/tcp   open  ssh',
            '  80/tcp   open  http',
            '  443/tcp  open  https',
            'Nmap done: 1 IP address scanned.',
          ]);
        } else {
          echo([`Nmap scan report for ${target}`, 'Host seems down.']);
        }
        return;
      }
      case 'submit': {
        const value = args.join(' ').trim();
        if (!value) {
          echo(['submit: missing flag']);
          return;
        }
        const found = Object.values(flags).find((f) => f.value === value);
        if (!found) {
          echo(['Invalid flag.']);
          return;
        }
        setSubmittedFlags((prev) => {
          const next = { ...prev, [found.id]: true };
          const sessionCollected = sessionFlags.filter((f) => next[f.id]).length;
          const total = sessionFlags.length || 1;
          const score = Math.round((sessionCollected / total) * 100);
          if (sessionCollected === total) {
            echo([`Flag accepted: ${found.name}`, `All session flags captured! Score: ${score}%`]);
            completeSession(score);
          } else {
            echo([`Flag accepted: ${found.name}`, `Progress: ${sessionCollected}/${total}`]);
          }
          return next;
        });
        return;
      }
      case 'exit': {
        const sessionCollected = sessionFlags.filter((f) => submittedFlags[f.id]).length;
        const total = sessionFlags.length || 1;
        const score = Math.round((sessionCollected / total) * 100);
        echo([`Finishing with score: ${score}%`]);
        completeSession(score);
        return;
      }
      default:
        echo([`${command}: command not found`]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCommand(input);
    setInput('');
  };

  return (
    <div className="flex h-full flex-col bg-black p-3 font-mono text-sm text-green-400">
      <div className="flex-1 overflow-auto">
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">{line}</div>
        ))}
        <div ref={scrollRef} />
      </div>
      <form onSubmit={handleSubmit} className="mt-2 flex">
        <span className="mr-2 whitespace-nowrap">&gt;</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent text-green-400 outline-none"
          autoFocus
          spellCheck={false}
        />
      </form>
    </div>
  );
}
