import { buildDefaultConstructedDeck } from './cardDatabase';

export const DECK_SIZE = 30;
export const MAX_COPIES_PER_CARD = 3;
export const PLAYER_DECK_STORAGE_KEY = 'mechanical-empire-player-deck-v1';

export function getDefaultDeckIds(): string[] {
  return buildDefaultConstructedDeck().map((card) => card.id);
}

export function normalizeDeckIds(ids: string[]): string[] {
  const counts = new Map<string, number>();
  const next: string[] = [];

  for (const id of ids) {
    const count = counts.get(id) ?? 0;
    if (count >= MAX_COPIES_PER_CARD || next.length >= DECK_SIZE) continue;
    counts.set(id, count + 1);
    next.push(id);
  }

  return next;
}

export function loadPlayerDeckIds(): string[] {
  if (typeof localStorage === 'undefined') return getDefaultDeckIds();

  try {
    const raw = localStorage.getItem(PLAYER_DECK_STORAGE_KEY);
    if (!raw) return getDefaultDeckIds();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return getDefaultDeckIds();
    const deck = normalizeDeckIds(parsed.filter((id): id is string => typeof id === 'string'));
    return deck.length > 0 ? deck : getDefaultDeckIds();
  } catch {
    return getDefaultDeckIds();
  }
}

export function savePlayerDeckIds(ids: string[]) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(PLAYER_DECK_STORAGE_KEY, JSON.stringify(normalizeDeckIds(ids)));
}
