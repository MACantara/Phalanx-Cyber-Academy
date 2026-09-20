/* Platform-owned manipulation-technique registry. Authors reference stable
   keys (`techniques: ['urgency']`) — labels live here so renaming never
   rewrites content. Same pattern as the speaker registry. */

export interface Technique {
  label: string;
  /** Shown as checklist subtext / review caption. */
  hint: string;
}

export const TECHNIQUES: Record<string, Technique> = {
  urgency: { label: 'Urgency', hint: 'Creates time pressure to skip verification' },
  spoofed_domain: { label: 'Spoofed domain', hint: 'Lookalike or misspelled sender/link domain' },
  impersonation: { label: 'Impersonation', hint: 'Poses as a trusted org or person' },
  credential_request: { label: 'Credential request', hint: 'Asks for passwords or codes directly' },
  attachment_lure: { label: 'Attachment lure', hint: 'Pushes a file to open or install' },
  too_good: { label: 'Too-good offer', hint: 'Prize, refund, or deal you never sought' },
  authority_claim: { label: 'False authority', hint: 'Claims power or credentials it lacks' },
  emotional_bait: { label: 'Emotional bait', hint: 'Fear, outrage, or sympathy over facts' },
  no_source: { label: 'No source', hint: 'Claims without citations or provenance' },
  cherry_pick: { label: 'Cherry-picked data', hint: 'Selective numbers or anecdotes as proof' },
};

export function techniqueLabel(key: string): string {
  return TECHNIQUES[key]?.label ?? key;
}
