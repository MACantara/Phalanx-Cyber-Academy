import type { LevelEnvironment, SpeakerProfile } from '../types';

/* Speaker registry — personification roles, not persona names. Content stores
   a role key ('instructor'); the registry maps it to the persona filling that
   role platform-wide. A level's scenario.cast entry can define or override a
   role without code changes. Unknown keys fall through to bare-label render. */

export type Speaker = SpeakerProfile;

const SPEAKERS: Record<string, Speaker> = {
  instructor: {
    name: 'Dr. Cipher',
    role: 'INSTRUCTOR',
    avatar: '/images/avatars/Cipher_Neutral_Talking.gif',
    avatarStatic: '/images/avatars/Cipher_Neutral.png',
  },
};

export function resolveSpeaker(
  key: string | undefined,
  env?: LevelEnvironment
): Speaker | undefined {
  if (!key) return undefined;
  return env?.scenario?.cast?.[key] ?? SPEAKERS[key];
}
