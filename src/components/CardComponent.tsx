import { motion } from 'motion/react';
import { Cpu, Command, Zap, Shield } from 'lucide-react';
import type { CardData, CardInstance } from '../game/gameTypes';

interface Props {
  card: CardData;
  instance?: CardInstance;
  scale?: number;
  selected?: boolean;
  playable?: boolean;
  onClick?: () => void;
  faceDown?: boolean;
  layoutId?: string;
}

const FACTION_GLOW: Record<string, string> = {
  steel: 'from-slate-600 to-slate-900',
  circuit: 'from-cyan-600 to-blue-900',
  plasma: 'from-fuchsia-600 to-purple-900',
  void: 'from-zinc-700 to-black',
};

const FACTION_ACCENT: Record<string, string> = {
  steel: 'text-slate-300',
  circuit: 'text-cyan-300',
  plasma: 'text-fuchsia-300',
  void: 'text-zinc-300',
};

export default function CardComponent({
  card,
  instance,
  scale = 1,
  selected = false,
  playable = true,
  onClick,
  faceDown = false,
  layoutId,
}: Props) {
  if (faceDown) {
    return (
      <div
        style={{ scale }}
        className="w-[220px] h-[340px] bg-[#0d0d10] border-2 border-cyan-500/10 rounded-[18px] flex items-center justify-center relative overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }}
        />
        <span className="text-cyan-500/30 font-black italic uppercase tracking-[0.4em] text-xs rotate-[-20deg]">
          ARCANA
        </span>
      </div>
    );
  }

  const isUnit = card.type === 'unit';
  const isTapped = instance?.isTapped ?? false;
  const isSick = instance?.sick ?? false;
  const accent = FACTION_ACCENT[card.faction] ?? 'text-white';
  const glow = FACTION_GLOW[card.faction] ?? 'from-gray-700 to-gray-900';
  const atk = (card.atk ?? 0) + (instance?.atkMod ?? 0);
  const def = (card.def ?? 0) + (instance?.defMod ?? 0);
  const hp = instance?.currentHp;

  const TypeIcon = card.type === 'unit'
    ? Cpu
    : card.type === 'program'
    ? Command
    : card.type === 'upgrade'
    ? Shield
    : Zap;

  return (
    <motion.div
      layoutId={layoutId}
      onClick={playable ? onClick : undefined}
      whileHover={playable ? { scale: 1.05 * scale, rotateY: 5 } : undefined}
      animate={{ rotate: isTapped ? 8 : 0 }}
      style={{ scale }}
      className={`relative w-[220px] h-[340px] bg-[#1a1a1e] rounded-[18px] border-2 overflow-hidden group shadow-2xl transition-colors
        ${selected ? 'border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.5)]' : 'border-white/5 hover:border-cyan-500/50'}
        ${playable ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}
        ${isSick ? 'grayscale' : ''}`}
    >
      <div className="absolute top-0 right-0 p-3 z-10 opacity-50 group-hover:opacity-100 transition-opacity">
        <TypeIcon className={`w-5 h-5 ${accent}`} />
      </div>

      <div className={`h-[180px] bg-gradient-to-b ${glow} flex flex-col items-center justify-center relative overflow-hidden`}>
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }}
        />

        <div className="relative z-10 text-center px-2">
          <span className="block text-[6px] font-mono text-white/40 uppercase tracking-[0.5em] mb-1">Arcana {card.tarotRoman}</span>
          <h4 className={`text-sm font-black italic uppercase tracking-widest ${accent}`}>{card.tarotName}</h4>
          <div className="text-5xl mt-2">{card.emojiArt}</div>
        </div>

        <div className="absolute bottom-2 w-full px-4 flex justify-between items-center z-10">
          <span className="text-[10px] font-mono text-white/40">ID:{card.id.slice(-6)}</span>
          <div className="flex gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`w-1 h-1 rounded-full ${i < card.cost ? 'bg-cyan-400 shadow-[0_0_4px_currentColor]' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between bg-[#141418] relative">
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className={`text-[8px] font-black uppercase tracking-widest ${accent}`}>{card.type}</span>
            <span className="text-[8px] font-mono text-white/30 uppercase">{card.faction}</span>
          </div>
          <h3 className="text-white text-base font-black italic tracking-tighter uppercase leading-tight line-clamp-1">{card.name}</h3>
          <p className="text-[9px] text-gray-400 font-mono leading-relaxed line-clamp-2 uppercase">{card.thaiName}</p>
          {card.effect && (
            <p className="text-[9px] text-cyan-400/80 font-mono leading-relaxed line-clamp-2 pt-1 border-t border-white/5 mt-1">
              {card.effect.description}
            </p>
          )}
        </div>

        {isUnit && (
          <div className="flex gap-2 pt-2">
            <div className="flex-1 bg-white/5 rounded p-2 text-center border border-white/5">
              <div className="text-[7px] text-gray-500 uppercase font-bold">ATK</div>
              <div className="text-xs font-black text-cyan-400">{atk}</div>
            </div>
            <div className="flex-1 bg-white/5 rounded p-2 text-center border border-white/5">
              <div className="text-[7px] text-gray-500 uppercase font-bold">{hp !== undefined ? 'HP' : 'DEF'}</div>
              <div className="text-xs font-black text-cyan-400">{hp !== undefined ? `${hp}/${def}` : def}</div>
            </div>
          </div>
        )}
      </div>

      {isSick && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-yellow-400 bg-black/60 px-2 py-1 rounded">SICK</span>
        </div>
      )}
    </motion.div>
  );
}
