import type { ComponentType } from 'react';
import { createElement } from 'react';
import type { ZodType } from 'zod';
import { Mail, Newspaper, FolderOpen, Folder, Globe, type LucideIcon } from 'lucide-react';
import { MailApp } from './MailApp';
import { ReaderApp } from './ReaderApp';
import { CaseApp } from './CaseApp';
import { FilesApp } from './FilesApp';
import { BrowserApp } from './BrowserApp';
import type { AppId } from '../types';
import {
  mailContentSchema,
  readerContentSchema,
  caseContentSchema,
  filesContentSchema,
  browserContentSchema,
} from '../lib/schemas';

export interface SimApp {
  id: AppId;
  name: string;
  icon: LucideIcon;
  component: ComponentType;
  schema?: ZodType;
}

const appRegistry: Record<AppId, SimApp> = {
  mail: { id: 'mail', name: 'Mail', icon: Mail, component: MailApp, schema: mailContentSchema },
  reader: { id: 'reader', name: 'Reader', icon: Newspaper, component: ReaderApp, schema: readerContentSchema },
  case: { id: 'case', name: 'Case Files', icon: FolderOpen, component: CaseApp, schema: caseContentSchema },
  files: { id: 'files', name: 'Files', icon: Folder, component: FilesApp, schema: filesContentSchema },
  browser: { id: 'browser', name: 'Browser', icon: Globe, component: BrowserApp, schema: browserContentSchema },
};

export function registerApp(app: SimApp) {
  appRegistry[app.id] = app;
}

export function getApp(id?: AppId): SimApp | undefined {
  return id ? appRegistry[id] : undefined;
}

export function getAppComponent(id?: AppId): ComponentType {
  const app = getApp(id);
  return (
    app?.component ??
    (() =>
      createElement(
        'div',
        { className: 'flex h-full items-center justify-center bg-stock text-ink' },
        `Unsupported app: ${id ?? 'none'}`
      ))
  );
}
