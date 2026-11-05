import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, Heart, RotateCcw, Zap } from 'lucide-react';
import type { PlayerColor } from '../types';
import { MAX_HP } from '../game/gameTypes';
import type { AiLevel, GamePhase, PlayerId } from '../game/gameTypes';
import { canBeAttackTarget, canPlay, getAtk } from '../game/gameEngine';
import { useGameState } from '../game/useGameState';
import CardView from './CardGame/CardView';

interface Props {
  color: PlayerColor;
  aiLevel?: AiLevel;
  playerDeckIds?: string[];
}

const PHASE_LABEL: Record<GamePhase, string> = {
  draw: 'Draw',
  main1: 'Main 1',
  order: 'Order',
  battle: 'Battle',
  main2: 'Main 2',
  end: 'End',
  gameover: 'Game Over',
};

const ownerLabel: Record<PlayerId, string> = {
  player: 'Player',
  ai: 'AI',
};

export default function ArenaView({ color, aiLevel = 'normal', playerDeckIds }: Props) {
  const { state, advance, handleCardClick, handleFieldClick, restart } = useGameState({ aiLevel, playerDeckIds });
  const { player, ai, active, attackerIids, attackTargets, log, message, phase, selectedIid, turn, winner } = state;
  const accent = color === 'blue' ? 'cyan' : 'red';
  const isPlayerTurn = active === 'player' && !winner;
  const maxPlayerEnergy = Math.max(3, player.cores + 3);

  const hpPct = (hp: number) => `${Math.max(0, Math.min(100, (hp / MAX_HP) * 100))}%`;
  const advanceLabel =
    phase === 'draw'
      ? 'Draw'
      : phase === 'main1'
      ? 'Order'
      : phase === 'order'
        ? attackerIids.length > 0
          ? `Attack ${attackerIids.length}`
          : 'Skip Attack'
        : phase === 'main2'
          ? 'End Turn'
          : 'Continue';
  const canAdvance = isPlayerTurn && ['draw', 'main1', 'order', 'main2'].includes(phase);

  return (
    <section className="relative flex flex-1 flex-col overflow-hidden px-3 py-4 md:px-8 md:py-6">
      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(108px,1fr)_auto_minmax(108px,1fr)_auto] gap-3">
        <CombatantBar
          name="AI"
          hp={ai.hp}
          hpPercent={hpPct(ai.hp)}
          energy={ai.energy}
          maxEnergy={Math.max(3, ai.cores + 3)}
          cores={ai.cores}
          handCount={ai.hand.length}
          deckCount={ai.deck.length}
          tone="red"
        />

        <div className="flex min-h-0 flex-col items-center justify-center gap-2">
          <div className="flex h-14 items-end gap-2">
            {ai.hand.slice(0, 8).map((card) => (
              <div key={card.iid} className="origin-bottom scale-[0.17]">
                <CardView card={card} faceDown />
              </div>
            ))}
          </div>
          <FieldRow emptyText="AI field empty">
            {ai.field.map((card) => {
              const targeted = isPlayerTurn && Object.values(attackTargets).includes(card.iid);
              const targetable =
                isPlayerTurn && phase === 'order' && selectedIid !== null && attackerIids.includes(selectedIid) && canBeAttackTarget(state, card.iid);
              return (
                <motion.div key={card.iid} layout className="origin-center scale-[0.48] -mx-14 -my-20 md:scale-[0.56]">
                  <CardView
                    card={card}
                    selected={selectedIid === card.iid || targeted || targetable}
                    onClick={() => handleFieldClick(card.iid, 'ai')}
                  />
                  {(targeted || targetable) && (
                    <div className="mt-[-48px] text-center text-[9px] font-black uppercase tracking-widest text-red-300">
                      {targeted ? 'Target' : 'Click to target'}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </FieldRow>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_360px_1fr] lg:items-center">
          <div className="hidden h-px bg-gradient-to-r from-transparent via-white/10 to-white/20 lg:block" />
          <div className="rounded-lg border border-white/10 bg-black/45 p-3 shadow-2xl backdrop-blur-xl">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.35em] text-white/40">Turn {turn}</div>
                <div className="text-lg font-black uppercase italic tracking-normal text-white">
                  {ownerLabel[active]} / {PHASE_LABEL[phase]}
                </div>
              </div>
              <button
                type="button"
                onClick={restart}
                className="grid h-10 w-10 place-items-center rounded border border-white/10 bg-white/5 text-white/70 transition hover:border-white/30 hover:text-white"
                aria-label="Restart game"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            <p className="line-clamp-1 font-mono text-[10px] uppercase text-cyan-300/80">{message}</p>
            <div className="mt-2 h-16 overflow-y-auto border-t border-white/10 pt-2 font-mono text-[10px] leading-relaxed">
              {log.slice(0, 5).map((entry, index) => (
                <div key={`${entry}-${index}`} className={index === 0 ? 'text-cyan-200' : 'text-white/45'}>
                  {entry}
                </div>
              ))}
            </div>
          </div>
          <div className="hidden h-px bg-gradient-to-l from-transparent via-white/10 to-white/20 lg:block" />
        </div>

        <FieldRow emptyText="Your field empty">
          {player.field.map((card) => {
            const attacking = attackerIids.includes(card.iid);
            const targetName = ai.field.find((unit) => unit.iid === attackTargets[card.iid])?.data.name;
            return (
              <motion.div
                key={card.iid}
                layout
                className={`origin-center scale-[0.48] -mx-14 -my-20 md:scale-[0.56] ${attacking ? '-translate-y-3' : ''}`}
              >
                <CardView
                  card={card}
                  selected={selectedIid === card.iid || attacking}
                  onClick={() => handleFieldClick(card.iid, 'player')}
                />
                {attacking && (
                  <div className="mt-[-48px] text-center text-[9px] font-black uppercase tracking-widest text-yellow-300">
                    ATK {getAtk(card)} → {ai.field.length === 0 ? 'Direct' : targetName ?? 'Auto'}
                  </div>
                )}
              </motion.div>
            );
          })}
        </FieldRow>

        <div className="space-y-3">
          <CombatantBar
            name="Player"
            hp={player.hp}
            hpPercent={hpPct(player.hp)}
            energy={player.energy}
            maxEnergy={maxPlayerEnergy}
            cores={player.cores}
            handCount={player.hand.length}
            deckCount={player.deck.length}
            tone={accent}
          />

          <div className="flex h-[190px] w-full items-end justify-start gap-1 overflow-x-auto px-2 pb-2 md:h-[210px] md:justify-center md:gap-3">
            <AnimatePresence>
              {player.hand.map((card) => {
                const playable = isPlayerTurn && canPlay(state, card);
                return (
                  <motion.div
                    key={card.iid}
                    layout
                    initial={{ y: 35, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    className="origin-bottom scale-[0.52] -mx-12 md:scale-[0.6]"
                  >
                    <CardView
                      card={card}
                      playable={playable}
                      selected={selectedIid === card.iid}
                      onClick={() => handleCardClick(card.iid)}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {canAdvance && (
        <button
          type="button"
          onClick={advance}
          className={`fixed bottom-6 right-6 z-50 flex h-14 items-center gap-3 rounded-full border-4 border-black px-5 text-sm font-black uppercase tracking-normal text-black shadow-2xl transition hover:scale-105 ${
            accent === 'cyan' ? 'bg-cyan-400' : 'bg-red-500'
          }`}
        >
          {advanceLabel}
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {!winner && active === 'ai' && (
        <div className="fixed left-1/2 top-24 z-40 -translate-x-1/2 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-300">
          AI thinking
        </div>
      )}

      <AnimatePresence>
        {winner && (
          <motion.div
            className="fixed inset-0 z-[80] grid place-items-center bg-black/80 p-6 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="flex w-full max-w-md flex-col items-center gap-5 rounded-2xl border border-white/10 bg-[#141418] p-8 text-center shadow-2xl"
            >
              <div className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-white/45">Battle Result</div>
              <h2 className="text-5xl font-black uppercase italic tracking-normal text-white">
                {winner === 'player' ? 'Victory' : 'Defeat'}
              </h2>
              <button
                type="button"
                onClick={restart}
                className={`flex h-12 items-center gap-3 rounded-lg px-6 text-sm font-black uppercase tracking-widest text-black transition hover:bg-white ${
                  accent === 'cyan' ? 'bg-cyan-400' : 'bg-red-500'
                }`}
              >
                <RotateCcw className="h-4 w-4" />
                Restart
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function FieldRow({ children, emptyText }: { children: React.ReactNode; emptyText: string }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);

  return (
    <div className="flex min-h-[132px] w-full flex-wrap items-center justify-center gap-2 overflow-hidden rounded-lg border border-white/5 bg-white/[0.025] px-3 py-2">
      {hasChildren ? children : <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/15">{emptyText}</span>}
    </div>
  );
}

function CombatantBar({
  name,
  hp,
  hpPercent,
  energy,
  maxEnergy,
  cores,
  handCount,
  deckCount,
  tone,
}: {
  name: string;
  hp: number;
  hpPercent: string;
  energy: number;
  maxEnergy: number;
  cores: number;
  handCount: number;
  deckCount: number;
  tone: 'cyan' | 'red';
}) {
  const toneClass = tone === 'cyan' ? 'text-cyan-300' : 'text-red-300';
  const barClass = tone === 'cyan' ? 'bg-cyan-400 shadow-[0_0_14px_#22d3ee]' : 'bg-red-500 shadow-[0_0_14px_#ef4444]';

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      <div className={`flex items-center gap-2 text-2xl font-black uppercase italic tracking-normal ${toneClass}`}>
        <Heart className="h-5 w-5" />
        {hp}
      </div>
      <div className="h-2 w-44 overflow-hidden rounded-full border border-white/10 bg-white/10 md:w-72">
        <motion.div animate={{ width: hpPercent }} className={`h-full ${barClass}`} />
      </div>
      <div className="flex items-center gap-2">
        <Zap className={`h-4 w-4 ${toneClass}`} />
        <div className="flex gap-1">
          {Array.from({ length: maxEnergy }).map((_, i) => (
            <span key={i} className={`h-3 w-2 rounded-sm ${i < energy ? barClass : 'bg-white/10'}`} />
          ))}
        </div>
      </div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-white/45">
        {name} / Energy {energy}/{maxEnergy} / Core {cores} / Hand {handCount} / Deck {deckCount}
      </div>
    </div>
  );
}
