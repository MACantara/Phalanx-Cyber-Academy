import type { LevelData } from '../types';

/* Proof environment — exercises the platform end to end: one machine, three
   apps, a scenario chain where events in one app change another.
   Chain: spot the phish (Mail) → follow its link (Browser) → find the stolen
   credentials (Files) → submit them (Browser) → recover the capture (Files).
   Reachable at /levels/preview — no backend required. */
export const PROOF_LEVEL: LevelData = {
  id: 0,
  name: 'The Credential Harvest',
  description: 'Multi-app environment preview — work one machine across Mail, Browser, and Files.',
  category: 'preview',
  difficulty: 'guided',
  xp_reward: 0,
  content: {
    environment: true,
    version: '1.0',
    title: 'The Credential Harvest',
    briefing:
      'A workstation was used in a credential-harvesting incident. Work the machine: read the mail, follow what the victim followed, and recover what the attacker took.',
    apps: [
      { appId: 'mail', label: 'Mail' },
      { appId: 'browser', label: 'Browser' },
      { appId: 'files', label: 'Files' },
    ],
    content: {
      mail: {
        emails: [
          {
            id: 'm-standup',
            from: 'm.okafor@phalanx.internal',
            subject: 'Standup notes — Tuesday',
            body: 'Hi team,\n\nNotes from this morning:\n\n- Sprint review moved to Thursday 14:00\n- Intranet portal maintenance Saturday 02:00–04:00, expect downtime\n- Reminder: IT will never ask for your password by mail\n\n— M.',
            isPhishing: false,
            explanation: 'Routine internal mail. Consistent sender domain, no urgency, no links, no credential requests.',
          },
          {
            id: 'm-verify',
            from: 'secure-alert@phalanx-verify.internal',
            subject: 'URGENT: Mailbox storage exceeded',
            body: 'Dear user,\n\nYour mailbox has exceeded its storage quota. Incoming mail is being rejected.\n\nVerify your account within 24 hours or access will be suspended.\n\nIT Helpdesk',
            isPhishing: true,
            redFlags: [
              'Lookalike sender domain (phalanx-verify.internal is not phalanx.internal)',
              'Manufactured urgency — 24 hour deadline',
              'Requests account verification through an external link',
            ],
            explanation:
              'Classic quota-scare phish. The sender domain imitates the internal one, and real IT never asks you to verify credentials over a link.',
            links: [{ label: 'Verify mailbox access', url: 'http://phalanx-verify.internal/' }],
          },
        ],
      },
      browser: {
        home: '',
        sites: [
          {
            id: 's-portal',
            url: 'http://intra.phalanx/portal',
            title: 'Phalanx Intranet — Employee Portal',
            body: 'PHALANX INTERNAL PORTAL\n\nMaintenance window: Saturday 02:00–04:00.\n\nSecurity notice: IT will never email you asking for credentials. Report suspicious mail to the security desk.',
          },
          {
            id: 's-verify',
            url: 'http://phalanx-verify.internal/',
            title: 'Account Verification — Phalanx Mail',
            body: 'Your mailbox is over quota.\n\nSign in to restore delivery. Failure to verify within 24 hours will suspend your account.',
            locked: true,
            form: {
              fields: [
                { id: 'username', label: 'Username' },
                { id: 'password', label: 'Password', password: true },
              ],
              submitLabel: 'Verify account',
            },
            afterSubmit:
              'Connection closed by remote host.\n\nWhatever was entered here was transmitted to an unverified endpoint — and captured.',
          },
        ],
      },
      files: {
        files: [
          {
            id: 'f-readme',
            name: 'readme.txt',
            path: '/docs',
            content:
              'WORKSTATION NOTES\n\nIntranet portal: http://intra.phalanx/portal\nReport suspicious mail to the security desk.\n\nIT will never ask for your password.',
          },
          {
            id: 'f-creds',
            name: 'portal-credentials.txt',
            path: '/docs',
            content:
              'TEMP CREDENTIALS (rotate on first login)\n\nusername: a.reyes\npassword: pxl-2049-Relay\n\n— written down "just until Friday"',
            hidden: true,
          },
          {
            id: 'f-incident',
            name: 'capture-0941.txt',
            path: '/forensics',
            content:
              'NETWORK CAPTURE — 09:41:07\n\nPOST http://phalanx-verify.internal/verify\nusername=a.reyes&password=pxl-2049-Relay\n\nCredentials exfiltrated to unverified host.\n\nFLAG: PHALANX{smish_harvested}',
            locked: true,
          },
        ],
      },
    },
    scenario: {
      objectives: [
        {
          id: 'obj-flag-phish',
          description: 'Identify the malicious email',
          event: { app: 'mail', action: 'classify', target: 'm-verify', data: { correct: true } },
          points: 250,
        },
        {
          id: 'obj-find-creds',
          description: 'Find the harvested credentials on disk',
          event: { app: 'files', action: 'open', target: 'f-creds' },
          points: 250,
        },
        {
          id: 'obj-submit',
          description: 'See what the victim saw — submit on the spoofed site',
          event: { app: 'browser', action: 'submit', target: 's-verify' },
          points: 250,
        },
        {
          id: 'obj-recover',
          description: 'Recover the forensic capture',
          event: { app: 'files', action: 'open', target: 'f-incident' },
          points: 250,
        },
      ],
      triggers: [
        {
          on: { app: 'mail', action: 'classify', target: 'm-verify', data: { correct: true } },
          once: true,
          then: [
            { unlock: 'f-creds' },
            { notify: 'Verdict logged. The phish was after credentials — check whether any were stored locally in Files.' },
          ],
        },
        {
          on: { app: 'mail', action: 'click-link', target: 'http://phalanx-verify.internal/' },
          once: true,
          then: [
            { unlock: 's-verify' },
            { openUrl: 'http://phalanx-verify.internal/' },
            { notify: 'Browser navigated to an unverified host.' },
          ],
        },
        {
          on: { app: 'browser', action: 'submit', target: 's-verify' },
          once: true,
          then: [
            { unlock: 'f-incident' },
            { notify: 'Credentials transmitted in the clear — a network capture was sealed into Files.' },
          ],
        },
      ],
    },
    scoring: {
      maxScore: 1000,
      passingScore: 600,
      rubric: [{ id: 'correct', label: 'Correct classification', maxPoints: 100 }],
    },
  },
};
