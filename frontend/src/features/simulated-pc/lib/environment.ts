import type {
  ArticleSandboxContent,
  CaseStoryContent,
  EmailSandboxContent,
  LevelEnvironment,
  SimulationContent,
} from '../types';

export function isEnvironment(
  content: SimulationContent | LevelEnvironment
): content is LevelEnvironment {
  return (content as LevelEnvironment).environment === true;
}

export function toEnvironment(
  content?: SimulationContent | LevelEnvironment
): LevelEnvironment | undefined {
  if (!content) return undefined;
  if (isEnvironment(content)) return content;

  switch (content.type) {
    case 'email-sandbox': {
      const c = content as EmailSandboxContent;
      return env(c, [{ appId: 'mail' }], { mail: { emails: c.emails } });
    }
    case 'article-sandbox': {
      const c = content as ArticleSandboxContent;
      return env(c, [{ appId: 'reader' }], { reader: { articles: c.articles } });
    }
    case 'case-story': {
      const c = content as CaseStoryContent;
      return env(c, [{ appId: 'case' }], {
        case: {
          initialSceneId: c.initialSceneId,
          scenes: c.scenes,
          evidence: c.evidence,
        },
      });
    }
    default:
      return undefined;
  }
}

function env(
  c: SimulationContent,
  apps: LevelEnvironment['apps'],
  content: LevelEnvironment['content']
): LevelEnvironment {
  return {
    environment: true,
    version: c.version,
    title: c.title,
    briefing: c.instructions,
    apps,
    content,
    scenario: c.dialogues ? { objectives: [], dialogues: c.dialogues } : undefined,
    scoring: c.scoring,
    adaptive: c.adaptive,
  };
}
