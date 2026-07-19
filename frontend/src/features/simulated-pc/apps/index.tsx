import type { LucideIcon } from 'lucide-react';
import {
  FileText,
  Globe,
  Mail,
  Folder,
  Terminal,
  Shield,
  Activity,
  Search,
  ClipboardList,
  Scale,
} from 'lucide-react';
import { NotepadApp } from './NotepadApp';
import { BrowserApp } from './BrowserApp';
import { EmailApp } from './EmailApp';
import { FilesApp } from './FilesApp';
import { TerminalApp } from './TerminalApp';
import { PlaceholderApp } from './PlaceholderApp';

interface AppDef {
  title: string;
  icon: LucideIcon;
  component: React.ComponentType<any>;
}

export const appRegistry: Record<string, AppDef> = {
  'notepad-app': { title: 'Notepad', icon: FileText, component: NotepadApp },
  'browser-app': { title: 'Browser', icon: Globe, component: BrowserApp },
  'email-app': { title: 'Email', icon: Mail, component: EmailApp },
  'files-app': { title: 'Files', icon: Folder, component: FilesApp },
  'terminal-app': { title: 'Terminal', icon: Terminal, component: TerminalApp },
  'malware-scanner-app': { title: 'Malware Scanner', icon: Shield, component: PlaceholderApp },
  'process-monitor-app': { title: 'Process Monitor', icon: Activity, component: PlaceholderApp },
  'evidence-viewer-app': { title: 'Evidence Viewer', icon: Search, component: PlaceholderApp },
  'investigation-hub-app': { title: 'Investigation Hub', icon: ClipboardList, component: PlaceholderApp },
  'forensic-report-app': { title: 'Forensic Report', icon: Scale, component: PlaceholderApp },
  // Legacy short keys kept for compatibility
  notepad: { title: 'Notepad', icon: FileText, component: NotepadApp },
  browser: { title: 'Browser', icon: Globe, component: BrowserApp },
  email: { title: 'Email', icon: Mail, component: EmailApp },
  files: { title: 'Files', icon: Folder, component: FilesApp },
  terminal: { title: 'Terminal', icon: Terminal, component: TerminalApp },
};

export function AppContent({ appId }: { appId?: string }) {
  const Component = appRegistry[appId ?? '']?.component ?? PlaceholderApp;
  return <Component title={appRegistry[appId ?? '']?.title ?? 'App'} />;
}

export { NotepadApp, BrowserApp, EmailApp, FilesApp, TerminalApp, PlaceholderApp };
