import type { EmailItem, EvidenceFlag } from '../types';

/* Region keys identify tappable evidence regions in an exhibit.
   sender/subject are whole-field; body regions are per-line; link regions
   are per-link. All regions are tappable — authored flags are the correct
   set, everything else is a decoy, so flag-everything scores poorly. */

export const regionKey = {
  sender: 'sender',
  subject: 'subject',
  body: (line: number) => `body:${line}`,
  link: (url: string) => `link:${url}`,
};

export function bodyLines(body: string): string[] {
  return body.split('\n').filter((l) => l.trim().length > 0);
}

/** Does marking `key` satisfy authored flag `f`? */
export function regionHitsFlag(key: string, f: EvidenceFlag, email: EmailItem): boolean {
  if (key === regionKey.sender) return f.region === 'sender';
  if (key === regionKey.subject) return f.region === 'subject';
  if (key.startsWith('body:')) {
    if (f.region !== 'body') return false;
    if (!f.match) return true;
    const line = bodyLines(email.body)[Number(key.slice(5))];
    return line ? line.includes(f.match) : false;
  }
  if (key.startsWith('link:')) {
    if (f.region !== 'link') return false;
    if (!f.match) return true;
    return key.slice(5).includes(f.match);
  }
  return false;
}

export interface FlagScore {
  hits: number;
  extra: number;
  total: number;
  /** hits / (authored + extra) — 1.0 means every mark was authored evidence
      and all authored evidence was found. */
  acc: number;
}

export function scoreFlags(email: EmailItem, marked: Set<string>): FlagScore {
  const authored = email.flags ?? [];
  const hits = authored.filter((f) =>
    [...marked].some((key) => regionHitsFlag(key, f, email))
  ).length;
  const extra = [...marked].filter(
    (key) => !authored.some((f) => regionHitsFlag(key, f, email))
  ).length;
  const denom = authored.length + extra;
  return { hits, extra, total: authored.length, acc: denom === 0 ? 1 : hits / denom };
}
