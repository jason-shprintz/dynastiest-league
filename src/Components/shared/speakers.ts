/**
 * Centralized speaker configuration for Mike & Jim analysis conversations.
 * Consumed by all conversation surfaces: trade cards, draft pick cards, team grade cards.
 */

export interface SpeakerConfig {
  /** Path to the speaker's avatar image */
  avatar: string;
  /** Which side of the conversation the speaker occupies */
  side: 'left' | 'right';
  /** Background color for this speaker's bubbles (must achieve ≥4.5:1 contrast with white text) */
  color: string;
  /** Display color for the speaker's name label */
  nameColor: string;
}

/**
 * Speaker configs for Mike & Jim — the shared analyst pair used across all surfaces.
 * Mike is always on the left (deep navy), Jim on the right (burnt orange).
 */
export const MIKE_AND_JIM_SPEAKERS: Record<string, SpeakerConfig> = {
  Mike: {
    avatar: '/MikeFantasy.webp',
    side: 'left',
    color: '#1a4a80',   // deep steel blue — ~11:1 contrast with white
    nameColor: '#ccd6f6', // textSecondary from theme
  },
  Jim: {
    avatar: '/JimFantasy.webp',
    side: 'right',
    color: '#8b2500',   // dark burnt orange — ~8:1 contrast with white
    nameColor: '#ffd700', // accent/gold from theme
  },
};
