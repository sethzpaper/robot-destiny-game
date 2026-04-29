export type CardType = 'unit' | 'program' | 'upgrade' | 'core';
export type Faction = 'steel' | 'circuit' | 'plasma' | 'void';
export type GamePhase = 'draw' | 'main1' | 'order' | 'battle' | 'main2' | 'end' | 'gameover';
export type PlayerId = 'player' | 'ai';
export type AiLevel = 'easy' | 'normal' | 'hard';
export type EffectTrigger = 'onPlay' | 'onDeath' | 'onAttack' | 'onTurnStart' | 'onTurnEnd' | 'whileOnField' | 'passive';
export type EffectTarget = 'friendly' | 'enemy' | 'any' | 'none';

export interface CardEffect {
  trigger: EffectTrigger;
  description: string;
  effectId: string;
  amount?: number;
  target?: EffectTarget;
}

export interface CardData {
  id: string;
  name: string;
  thaiName: string;
  type: CardType;
  faction: Faction;
  cost: number;
  atk?: number;
  def?: number;
  effect?: CardEffect;
  flavorText: string;
  tarotName: string;
  tarotRoman: string;
  emojiArt: string;
}

export interface CardInstance {
  iid: string;
  data: CardData;
  currentHp: number;
  isTapped: boolean;
  sick: boolean;
  atkMod: number;
  defMod: number;
  silenced?: boolean;
  taunt?: boolean;
}

export interface PlayerState {
  id: PlayerId;
  name: string;
  hp: number;
  cores: number;
  energy: number;
  playedCore: boolean;
  hand: CardInstance[];
  deck: CardInstance[];
  field: CardInstance[];
  graveyard: CardInstance[];
}

export interface GameState {
  phase: GamePhase;
  turn: number;
  active: PlayerId;
  player: PlayerState;
  ai: PlayerState;
  selectedIid: string | null;
  attackerIids: string[];
  log: string[];
  winner: PlayerId | null;
  message: string;
  busy: boolean;
}

export interface GameOptions {
  playerDeckIds?: string[];
  aiDeckIds?: string[];
  aiLevel?: AiLevel;
}
