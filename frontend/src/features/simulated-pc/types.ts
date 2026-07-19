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

export interface LevelContent {
  config: Record<string, unknown>;
  dialogues: Record<string, DialoguePhase>;
  data: Record<string, unknown>;
}

export interface LevelData {
  id: number;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  xp_reward: number;
  session_id?: string;
  content?: LevelContent;
}

export interface AppConfig {
  id: string;
  title: string;
  icon: string;
  component: React.ComponentType;
  level?: number;
}

export interface OpenWindow {
  id: string;
  title: string;
  icon: string;
  zIndex: number;
  appId?: string;
  minimized?: boolean;
}

export interface DialogueLine {
  speaker: string;
  text: string;
}
