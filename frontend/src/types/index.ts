export interface Level {
  id: number;
  level_id: number;
  name: string;
  description: string | null;
  category: string | null;
  icon: string | null;
  estimated_time: string | null;
  xp_reward: number;
  skills: string[];
  difficulty: string;
  unlocked: boolean;
  coming_soon: boolean;
}

export interface User {
  id: number;
  username: string | null;
  email: string;
  is_admin: boolean;
  total_xp: number;
}
