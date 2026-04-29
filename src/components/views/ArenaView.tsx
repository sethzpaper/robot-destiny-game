import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, RotateCcw, Heart, Zap as ZapIcon } from 'lucide-react';
import { useGameState } from '../../game/useGameState';
import { canPlay, getAtk } from '../../game/gameEngine';
import type { GamePhase } from '../../game/gameTypes';
import type { PlayerColor } from '../../types';
import CardComponent from '../CardComponent';

interface Props {
  color: PlayerColor;
}

const PHASE_TH: Record<GamePhase, string> = {
  draw: 'จั่วการ์ด',
  main1: 'เมน 1',
  order: 'จัดการโจมตี',
  battle: 'ต่อสู้',
  main2: 'เมน 2',
  end: 'จบเทิร์น',
  gameover: 'จบเกม',
};

export default function ArenaView({ color }: Props) {
  const { state, handleCardClick, handleFieldClick, advance, restart } = useGameState();
  const { player, ai, phase, turn, active, selectedIid, attackerIids, log, winner, message } = state;

  const isPlayerTurn = active === 'player' && !winner;
  const playerAccent = color === 'blue' ? 'cyan' : 'red';
  const playerHpPct = (player.hp / 200) * 100;
  const aiHpPct = (ai.hp / 200) * 100;
  const maxEnergy = Math.max(10, player.cores + 3);

  const advanceLabel = () => {
    if (phase === 'main1') return 'Order →';
    if (phase === 'order') return attackerIids.length > 0 ? `โจมตี (${attackerIids.length})` : 'ข้าม';
    if (phase === 'main2') return 'จบเทิร์น';
    if (phase === 'draw') return 'จั่วไพ่';
    return 'ถัดไป →';
  };
  const showAdvance = isPlayerTurn && (phase === 'main1' || phase === 'order' || phase === 'main2' || phase === 'draw');

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 overflow-hidden relative">
      {/* AI Side (top) */}
      <div className="flex flex-col items-center gap-3 opacity-90">
        <div className="flex items-center gap-6 md:gap-10">
          <div className="text-3xl font-black italic text-red-500 uppercase tracking-tighter flex items-center gap-2">
            <Heart className="w-5 h-5" /> {ai.hp}
          </div>
          <div className="w-48 md:w-72 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div animate={{ width: `${aiHpPct}%` }} className="h-full bg-red-600 shadow-[0_0_15px_#dc2626]" />
          </div>
          <div className="text-[10px] font-mono text-red-400/60 uppercase tracking-widest">AI · {ai.hand.length} cards · {ai.deck.length} deck</div>
        </div>

        {/* AI face-down hand */}
        <div className="flex gap-2 h-16 items-end">
          {Array.from({ length: Math.min(ai.hand.length, 7) }).map((_, i) => (
            <div key={i} className="w-10 h-14 bg-red-500/5 border border-red-500/20 rounded flex items-center justify-center">
              <span className="text-[7px] text-red-900 font-black uppercase rotate-90 tracking-widest">CLASSIFIED</span>
            </div>
          ))}
        </div>

        {/* AI field */}
        <div className="flex gap-3 min-h-[180px] items-center justify-center w-full px-4 flex-wrap">
          {ai.field.length === 0 && (
            <span className="text-[10px] font-mono text-white/15 uppercase tracking-widest">— ไม่มียูนิตในสนาม —</span>
          )}
          <AnimatePresence>
            {ai.field.map((c) => (
              <motion.div key={c.iid} layout initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0 }}>
                <div className="scale-[0.55] origin-center -my-16 -mx-12">
                  <CardComponent
                    card={c.data}
                    instance={c}
                    selected={selectedIid === c.iid}
                    onClick={() => handleFieldClick(c.iid, 'ai')}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Center divider + log */}
      <div className="my-2 flex justify-center">
        <div className="w-full max-w-2xl bg-black/40 border border-white/5 rounded-xl px-4 py-2 font-mono text-[10px] backdrop-blur-xl relative shadow-2xl">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#0a0a0c] border border-white/10 rounded text-[8px] uppercase tracking-widest text-cyan-400">
            {PHASE_TH[phase]} · {message}
          </div>
          <div className="space-y-0.5 h-12 overflow-y-auto">
            {log.slice(0, 4).map((l, i) => (
              <div key={i} className={i === 0 ? 'text-cyan-300' : 'text-gray-500'}>
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Player Side (bottom) */}
      <div className="flex-1 flex flex-col items-center gap-3 justify-end">
        {/* Player field */}
        <div className="flex gap-3 min-h-[180px] items-center justify-center w-full px-4 flex-wrap">
          {player.field.length === 0 && (
            <span className="text-[10px] font-mono text-white/15 uppercase tracking-widest">— สนามของคุณว่างเปล่า —</span>
          )}
          <AnimatePresence>
            {player.field.map((c) => {
              const isAttacker = attackerIids.includes(c.iid);
              return (
                <motion.div key={c.iid} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0 }}>
                  <div className={`scale-[0.55] origin-center -my-16 -mx-12 transition-transform ${isAttacker ? 'translate-y-[-10px]' : ''}`}>
                    <CardComponent
                      card={c.data}
                      instance={c}
                      selected={selectedIid === c.iid || isAttacker}
                      onClick={() => handleFieldClick(c.iid, 'player')}
                    />
                  </div>
                  {isAttacker && (
                    <div className="text-center text-[9px] font-black uppercase tracking-widest text-yellow-400 -mt-12">
                      ⚔ ATK {getAtk(c)}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Player HP/Mana row */}
        <div className="flex items-center gap-6 md:gap-10">
          <div className={`text-3xl font-black italic uppercase tracking-tighter flex items-center gap-2 ${playerAccent === 'cyan' ? 'text-cyan-500' : 'text-red-500'}`}>
            <Heart className="w-5 h-5" /> {player.hp}
          </div>
          <div className="w-48 md:w-72 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              animate={{ width: `${playerHpPct}%` }}
              className={`h-full ${playerAccent === 'cyan' ? 'bg-cyan-500 shadow-[0_0_15px_#06b6d4]' : 'bg-red-500 shadow-[0_0_15px_#ef4444]'}`}
            />
          </div>
          <div className="flex flex-col items-start">
            <div className="flex gap-1 mb-1">
              {Array.from({ length: maxEnergy }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-3 rounded-sm transition-all ${
                    i < player.energy
                      ? playerAccent === 'cyan'
                        ? 'bg-cyan-400 shadow-[0_0_6px_#06b6d4]'
                        : 'bg-red-400 shadow-[0_0_6px_#ef4444]'
                      : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
            <div className={`text-[9px] font-black tracking-widest flex items-center gap-1 ${playerAccent === 'cyan' ? 'text-cyan-400' : 'text-red-400'}`}>
              <ZapIcon className="w-3 h-3" /> ENERGY {player.energy}/{maxEnergy} · CORE {player.cores}
            </div>
          </div>
        </div>

        {/* Player hand */}
        <div className="flex gap-1 md:gap-3 h-56 items-end overflow-x-auto pb-2 px-4 w-full justify-center">
          <AnimatePresence>
            {player.hand.map((c) => {
              const playable = isPlayerTurn && canPlay(state, c);
              return (
                <motion.div
                  key={c.iid}
                  layout
                  layoutId={c.iid}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={playable ? { y: -20, transition: { duration: 0.15 } } : undefined}
                  onClick={() => handleCardClick(c.iid)}
                >
                  <div className="scale-[0.62] origin-bottom -mx-10">
                    <CardComponent
                      card={c.data}
                      instance={c}
                      selected={selectedIid === c.iid}
                      playable={playable}
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating advance button */}
      {showAdvance && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={advance}
          className={`fixed bottom-8 right-8 px-6 h-16 rounded-full flex items-center gap-3 border-4 border-black hover:scale-105 transition-all shadow-2xl z-50 ${
            playerAccent === 'cyan' ? 'bg-cyan-500' : 'bg-red-500'
          }`}
        >
          <span className="text-sm font-black uppercase tracking-tight text-black">{advanceLabel()}</span>
          <ChevronRight className="w-6 h-6 text-black" />
        </motion.button>
      )}

      {/* Game Over overlay */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#141418] border-2 border-white/10 rounded-[40px] p-12 max-w-md w-full mx-6 flex flex-col items-center gap-6 shadow-2xl"
            >
              <div className={`text-[10px] font-black uppercase tracking-[0.4em] ${winner === 'player' ? 'text-cyan-400' : 'text-red-400'}`}>
                Battle Result
              </div>
              <h2 className="text-6xl font-black italic uppercase tracking-tighter">
                {winner === 'player' ? 'VICTORY' : 'DEFEAT'}
              </h2>
              <p className="text-gray-400 font-mono text-xs uppercase tracking-widest text-center">
                {winner === 'player' ? 'ระบบยืนยัน — ภารกิจสำเร็จ' : 'ข้อมูลผู้เล่นถูกลบจากเครือข่าย'}
              </p>
              <button
                onClick={restart}
                className={`mt-4 px-8 h-14 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-3 ${
                  playerAccent === 'cyan' ? 'bg-cyan-500' : 'bg-red-500'
                } text-black hover:bg-white transition-all`}
              >
                <RotateCcw className="w-5 h-5" /> เล่นอีกครั้ง
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI thinking indicator */}
      {!winner && active === 'ai' && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
          AI กำลังคิด...
        </div>
      )}
    </div>
  );
}
