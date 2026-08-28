export interface DialogueMessage {
  text: string;
  example?: string;
  choices?: {
    text: string;
    value: string;
    correct?: boolean;
    feedback?: string;
    next?: string;
  }[];
}

export interface DialoguePhase {
  character: string;
  messages: DialogueMessage[];
}

export interface ScoringRules {
  maxScore: number;
  passingScore: number;
  rubric: RubricItem[];
  penalties?: Record<string, number>;
  bonuses?: Record<string, number>;
}

export interface RubricItem {
  id: string;
  label: string;
  maxPoints: number;
}

export interface ScoringEvent {
  type: 'email-classified' | 'choice' | 'flag-captured';
  id: string;
  points: number;
}

export interface AdaptiveConfig {
  enabled: boolean;
  variants?: VariantTemplate[];
}

export interface VariantTemplate {
  field: string;
  pool: string[];
}

export interface BaseContent {
  type: SimulationContentType;
  version: string;
  title: string;
  instructions?: string;
  dialogues?: Record<string, DialoguePhase>;
  scoring: ScoringRules;
  adaptive?: AdaptiveConfig;
}

export type SimulationContentType =
  | 'case-story'
  | 'email-sandbox'
  | 'terminal-ctf'
  | 'article-sandbox';

export interface CaseStoryContent extends BaseContent {
  type: 'case-story';
  initialSceneId: string;
  scenes: Record<string, CaseScene>;
  evidence: CaseEvidence;
}

export interface CaseScene {
  id: string;
  narrative: string;
  speaker?: string;
  choices: CaseChoice[];
  requiredEvidence?: string[];
}

export interface CaseChoice {
  id: string;
  text: string;
  score: number;
  feedback?: string;
  next?: string;
}

export interface CaseEvidence {
  emails?: EmailItem[];
  files?: FileItem[];
  terminal?: TerminalCommand[];
  network?: NetworkEvent[];
  items?: EvidenceItem[];
}

export type EvidenceItemKind = 'image' | 'hex' | 'packets' | 'text';

export interface EvidenceItem {
  id: string;
  kind: EvidenceItemKind;
  title: string;
  content: string;
  description?: string;
}

export interface EmailSandboxContent extends BaseContent {
  type: 'email-sandbox';
  emails: EmailItem[];
}

export interface EmailItem {
  id: string;
  from: string;
  subject: string;
  body: string;
  isPhishing: boolean;
  redFlags?: string[];
  explanation?: string;
}

export interface TerminalCtfContent extends BaseContent {
  type: 'terminal-ctf';
  fileSystem: FsNode;
  flags: CtfFlags;
}

export interface FsNode {
  type: 'directory' | 'file';
  content?: string;
  contents?: Record<string, FsNode>;
  hidden?: boolean;
  size?: number;
  flag_ids?: string[];
}

export interface CtfFlag {
  id: string;
  value: string;
  name: string;
  challenge_question: string;
  location?: string;
  hints?: string[];
}

export interface CtfFlags {
  challenge_name: string;
  challenge_description: string;
  total_flags_available: number;
  flags_per_session: number;
  flags: Record<string, CtfFlag>;
}

export interface ArticleSandboxContent extends BaseContent {
  type: 'article-sandbox';
  articles: Article[];
}

export interface Article {
  id: string;
  title: string;
  author: string;
  author_credentials?: string;
  date: string;
  website: string;
  content: string;
  label: number;
}

export interface FileItem {
  id: string;
  name: string;
  path: string;
  content: string;
  hidden?: boolean;
}

export interface TerminalCommand {
  id: string;
  command: string;
  output: string;
}

export interface NetworkEvent {
  id: string;
  timestamp: string;
  source: string;
  destination: string;
  protocol: string;
  info: string;
  suspicious: boolean;
}

export type SimulationContent =
  | CaseStoryContent
  | EmailSandboxContent
  | TerminalCtfContent
  | ArticleSandboxContent;

export interface LevelData {
  id: number;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  xp_reward: number;
  session_id?: string;
  content?: SimulationContent;
}

export interface OpenWindow {
  id: string;
  title: string;
  icon: string;
  zIndex: number;
  appId?: string;
  minimized?: boolean;
}
