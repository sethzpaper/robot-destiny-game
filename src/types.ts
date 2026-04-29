export type AppView =
  | 'landing'
  | 'colorSelection'
  | 'howToPlay'
  | 'showCards'
  | 'deckBuilder'
  | 'settings'
  | 'arena';

export type PlayerColor = 'blue' | 'red';
export type AiLevel = 'easy' | 'normal' | 'hard';

export interface GameSettings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  playerColor: PlayerColor;
  aiLevel: AiLevel;
  keyBindings: Record<string, string>;
}

export const DEFAULT_SETTINGS: GameSettings = {
  musicEnabled: true,
  sfxEnabled: true,
  playerColor: 'blue',
  aiLevel: 'normal',
  keyBindings: {
    '1': 'การ์ด 1',
    '2': 'การ์ด 2',
    '3': 'การ์ด 3',
    Space: 'ข้ามเฟส',
    Esc: 'ยกเลิกการเลือก',
  },
};
