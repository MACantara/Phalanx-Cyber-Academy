import { z } from 'zod';

/* Runtime validation for environment content. Schemas check that required
   fields exist and are well-typed; unknown/extra keys are tolerated (legacy
   payloads carry fields like `source_type` that types don't declare). We
   validate with safeParse for error reporting and keep the original object —
   never substitute the parsed (stripped) output. */

export const emailLinkSchema = z.object({
  label: z.string(),
  url: z.string(),
});

export const emailItemSchema = z.object({
  id: z.string(),
  from: z.string(),
  subject: z.string(),
  body: z.string(),
  isPhishing: z.boolean(),
  redFlags: z.array(z.string()).optional(),
  explanation: z.string().optional(),
  locked: z.boolean().optional(),
  links: z.array(emailLinkSchema).optional(),
});

export const articleSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string(),
  author_credentials: z.string().optional(),
  date: z.string(),
  website: z.string(),
  content: z.string(),
  label: z.number(),
});

export const fileItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  content: z.string(),
  hidden: z.boolean().optional(),
  locked: z.boolean().optional(),
});

export const caseChoiceSchema = z.object({
  id: z.string(),
  text: z.string(),
  score: z.number(),
  feedback: z.string().optional(),
  next: z.string().optional(),
});

export const caseSceneSchema = z.object({
  id: z.string(),
  narrative: z.string(),
  speaker: z.string().optional(),
  choices: z.array(caseChoiceSchema),
  requiredEvidence: z.array(z.string()).optional(),
});

export const evidenceItemSchema = z.object({
  id: z.string(),
  kind: z.enum(['image', 'hex', 'packets', 'text']),
  title: z.string(),
  content: z.string(),
  description: z.string().optional(),
});

export const terminalCommandSchema = z.object({
  id: z.string(),
  command: z.string(),
  output: z.string(),
});

export const networkEventSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  source: z.string(),
  destination: z.string(),
  protocol: z.string(),
  info: z.string(),
  suspicious: z.boolean(),
});

export const caseEvidenceSchema = z.object({
  emails: z.array(emailItemSchema).optional(),
  files: z.array(fileItemSchema).optional(),
  terminal: z.array(terminalCommandSchema).optional(),
  network: z.array(networkEventSchema).optional(),
  items: z.array(evidenceItemSchema).optional(),
});

export const browserFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  password: z.boolean().optional(),
});

export const browserSiteSchema = z.object({
  id: z.string(),
  url: z.string(),
  title: z.string(),
  body: z.string(),
  locked: z.boolean().optional(),
  form: z
    .object({
      fields: z.array(browserFieldSchema),
      submitLabel: z.string().optional(),
    })
    .optional(),
  afterSubmit: z.string().optional(),
});

/* App content slices — environment.content[appId] */

export const mailContentSchema = z.object({ emails: z.array(emailItemSchema) });
export const readerContentSchema = z.object({ articles: z.array(articleSchema) });
export const filesContentSchema = z.object({ files: z.array(fileItemSchema) });
export const browserContentSchema = z.object({
  sites: z.array(browserSiteSchema),
  home: z.string().optional(),
});
export const caseContentSchema = z.object({
  initialSceneId: z.string(),
  scenes: z.record(z.string(), caseSceneSchema),
  evidence: caseEvidenceSchema,
});

/* Content-library item kinds — the units a `lib:kind:key` ref resolves to */

export const contentItemSchemas = {
  emails: emailItemSchema,
  articles: articleSchema,
  files: fileItemSchema,
  sites: browserSiteSchema,
  scenes: caseSceneSchema,
  evidence: evidenceItemSchema,
} as const;

export type ContentKind = keyof typeof contentItemSchemas;

export const contentKinds = Object.keys(contentItemSchemas) as ContentKind[];

/* Environment + scenario — validated by the level editor */

export const scoringRulesSchema = z.object({
  maxScore: z.number(),
  passingScore: z.number(),
  rubric: z.array(z.object({ id: z.string(), label: z.string(), maxPoints: z.number() })),
  penalties: z.record(z.string(), z.number()).optional(),
  bonuses: z.record(z.string(), z.number()).optional(),
});

export const eventMatcherSchema = z.object({
  app: z.string(),
  action: z.string(),
  target: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export const objectiveSchema = z.object({
  id: z.string(),
  description: z.string(),
  event: eventMatcherSchema,
  points: z.number(),
  required: z.boolean().optional(),
});

export const notifyMessageSchema = z.object({
  text: z.string(),
  speaker: z.string().optional(),
});

export const triggerSchema = z.object({
  on: eventMatcherSchema,
  then: z.array(
    z.object({
      unlock: z.string().optional(),
      notify: z.union([z.string(), notifyMessageSchema]).optional(),
      objective: z.string().optional(),
      openUrl: z.string().optional(),
    })
  ),
  once: z.boolean().optional(),
});

export const scenarioBriefingSchema = z.object({
  speaker: z.string().optional(),
  messages: z.array(
    z.object({
      text: z.string(),
      example: z.string().optional(),
    })
  ),
});

export const levelEnvironmentSchema = z.object({
  environment: z.literal(true),
  version: z.string(),
  title: z.string(),
  briefing: z.string().optional(),
  apps: z.array(
    z.object({
      appId: z.string(),
      label: z.string().optional(),
      icon: z.string().optional(),
      pinned: z.boolean().optional(),
    })
  ),
  content: z.record(z.string(), z.unknown()),
  scenario: z
    .object({
      objectives: z.array(objectiveSchema),
      triggers: z.array(triggerSchema).optional(),
      dialogues: z.record(z.string(), z.unknown()).optional(),
      briefing: scenarioBriefingSchema.optional(),
    })
    .optional(),
  scoring: scoringRulesSchema,
  adaptive: z
    .object({
      enabled: z.boolean(),
      variants: z.array(z.object({ field: z.string(), pool: z.array(z.string()) })).optional(),
    })
    .optional(),
});

export interface ContentIssue {
  path: string;
  message: string;
}

export function issuesOf(error: z.ZodError): ContentIssue[] {
  return error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
}

export function validateAppContent(
  content: unknown,
  schema?: z.ZodType
): ContentIssue[] {
  if (!schema) return [];
  const res = schema.safeParse(content);
  return res.success ? [] : issuesOf(res.error);
}
