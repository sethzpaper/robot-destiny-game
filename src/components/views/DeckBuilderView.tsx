import { useMemo, useState } from 'react';
import { LogOut, Minus, Save, Trash2 } from 'lucide-react';
import { ALL_CARDS, CARD_BY_ID } from '../../game/cardDatabase';
import type { CardData, CardInstance } from '../../game/gameTypes';
import { DECK_SIZE, loadPlayerDeckIds, MAX_COPIES_PER_CARD, normalizeDeckIds, savePlayerDeckIds } from '../../game/deckStorage';
import CardView from '../CardGame/CardView';

interface Props {
  onBack: () => void;
}

function previewInstance(card: CardData): CardInstance {
  return {
    iid: `deck-preview-${card.id}`,
    data: card,
    currentHp: card.def ?? 0,
    isTapped: false,
    sick: false,
    atkMod: 0,
    defMod: 0,
  };
}

export default function DeckBuilderView({ onBack }: Props) {
  const [deckIds, setDeckIds] = useState(() => normalizeDeckIds(loadPlayerDeckIds()));
  const [selectedId, setSelectedId] = useState(ALL_CARDS[0]?.id ?? '');
  const selected = CARD_BY_ID.get(selectedId) ?? ALL_CARDS[0];

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    deckIds.forEach((id) => map.set(id, (map.get(id) ?? 0) + 1));
    return map;
  }, [deckIds]);

  const deckList = useMemo(
    () =>
      Array.from(counts.entries())
        .map(([id, count]) => ({ card: CARD_BY_ID.get(id), count }))
        .filter((entry): entry is { card: CardData; count: number } => Boolean(entry.card))
        .sort((a, b) => a.card.cost - b.card.cost || a.card.name.localeCompare(b.card.name)),
    [counts],
  );

  const addCard = (id: string) => {
    if (deckIds.length >= DECK_SIZE) return;
    if ((counts.get(id) ?? 0) >= MAX_COPIES_PER_CARD) return;
    setDeckIds((ids) => normalizeDeckIds([...ids, id]));
  };

  const removeCard = (id: string) => {
    const index = deckIds.indexOf(id);
    if (index < 0) return;
    setDeckIds((ids) => ids.filter((_, i) => i !== index));
  };

  const saveDeck = () => savePlayerDeckIds(deckIds);

  return (
    <div className="flex h-screen flex-1 flex-col gap-6 overflow-hidden p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-normal text-white">Deck Builder</h2>
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/45">
            {deckIds.length}/{DECK_SIZE} cards / max {MAX_COPIES_PER_CARD} copies
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDeckIds([])}
            className="grid h-11 w-11 place-items-center rounded border border-red-400/20 bg-red-500/10 text-red-300 transition hover:bg-red-500/20"
            aria-label="Clear deck"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={saveDeck}
            disabled={deckIds.length !== DECK_SIZE}
            className="flex h-11 items-center gap-2 rounded bg-cyan-400 px-5 text-sm font-black uppercase text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
          <button type="button" onClick={onBack} className="grid h-11 w-11 place-items-center rounded bg-white/5 transition hover:bg-white/10">
            <LogOut className="h-5 w-5 rotate-180" />
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="min-h-0 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {ALL_CARDS.map((card) => {
              const count = counts.get(card.id) ?? 0;
              const disabled = deckIds.length >= DECK_SIZE || count >= MAX_COPIES_PER_CARD;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(card.id);
                    addCard(card.id);
                  }}
                  className={`flex items-center gap-4 rounded-lg border p-3 text-left transition ${
                    selectedId === card.id ? 'border-cyan-300 bg-cyan-400/10' : 'border-white/10 bg-white/[0.03] hover:border-white/30'
                  } ${disabled ? 'opacity-60' : ''}`}
                >
                  <div className="text-3xl">{card.emojiArt}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black uppercase italic text-white">{card.name}</div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-white/40">
                      {card.type} / cost {card.cost}
                    </div>
                  </div>
                  <div className="grid h-8 w-8 place-items-center rounded bg-white/5 font-black text-cyan-300">{count}</div>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="flex min-h-0 flex-col gap-4">
          <div className="flex justify-center rounded-lg border border-white/10 bg-black/25 py-4">
            {selected && <CardView card={previewInstance(selected)} scale={0.72} playable={false} />}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-white/10 bg-black/25 p-3">
            {deckList.map(({ card, count }) => (
              <div key={card.id} className="mb-2 flex items-center gap-3 rounded border border-white/5 bg-white/[0.03] p-2">
                <span className="w-6 text-center text-lg">{card.emojiArt}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-black uppercase text-white">{card.name}</div>
                  <div className="font-mono text-[9px] uppercase text-white/35">x{count}</div>
                </div>
                <button
                  type="button"
                  onClick={() => removeCard(card.id)}
                  className="grid h-8 w-8 place-items-center rounded bg-white/5 text-white/60 transition hover:bg-red-500/20 hover:text-red-300"
                  aria-label={`Remove ${card.name}`}
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
