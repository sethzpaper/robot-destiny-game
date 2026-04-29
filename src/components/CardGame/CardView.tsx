import { motion } from 'motion/react';
import { Command, Cpu, Shield, Sparkles } from 'lucide-react';
import type { CardInstance } from '../../game/gameTypes';

export interface CardViewProps {
  card: CardInstance;
  selected?: boolean;
  playable?: boolean;
  faceDown?: boolean;
  scale?: number;
  onClick?: () => void;
}

const FACTION_GLOW: Record<string, string> = {
  steel: 'from-slate-500 to-zinc-950',
  circuit: 'from-cyan-500 to-blue-950',
  plasma: 'from-fuchsia-500 to-purple-950',
  void: 'from-zinc-600 to-black',
};

const FACTION_ACCENT: Record<string, string> = {
  steel: 'text-slate-200',
  circuit: 'text-cyan-200',
  plasma: 'text-fuchsia-200',
  void: 'text-zinc-200',
};

function signed(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

export default function CardView({
  card,
  selected = false,
  playable = true,
  faceDown = false,
  scale = 1,
  onClick,
}: CardViewProps) {
  if (faceDown) {
    return (
      <div
        style={{ scale }}
        className="relative h-[340px] w-[220px] overflow-hidden rounded-[18px] border-2 border-red-500/20 bg-[#0d0d10] shadow-2xl"
      >
        <div className="absolute inset-4 rounded-xl border border-red-400/10" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_35%,rgba(239,68,68,0.12),transparent_65%)]" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-18deg] text-xs font-black uppercase tracking-[0.45em] text-red-400/30">
          Enemy
        </div>
      </div>
    );
  }

  const data = card.data;
  const accent = FACTION_ACCENT[data.faction] ?? 'text-white';
  const glow = FACTION_GLOW[data.faction] ?? 'from-gray-600 to-gray-950';
  const atk = (data.atk ?? 0) + card.atkMod;
  const def = (data.def ?? 0) + card.defMod;
  const hasAtkMod = card.atkMod !== 0;
  const hasDefMod = card.defMod !== 0;
  const isUnit = data.type === 'unit';
  const TypeIcon =
    data.type === 'unit' ? Cpu : data.type === 'program' ? Command : data.type === 'upgrade' ? Shield : Sparkles;

  return (
    <motion.button
      type="button"
      onClick={playable ? onClick : undefined}
      whileHover={playable ? { scale: 1.05 * scale, rotateY: 5 } : undefined}
      animate={{ rotate: card.isTapped ? 90 : 0 }}
      style={{ scale }}
      className={`group relative h-[340px] w-[220px] overflow-hidden rounded-[18px] border-2 bg-[#17171b] text-left shadow-2xl transition-colors
        ${selected ? 'border-cyan-300 shadow-[0_0_32px_rgba(34,211,238,0.45)]' : 'border-white/10 hover:border-cyan-400/50'}
        ${playable ? 'cursor-pointer' : 'cursor-not-allowed opacity-65'}`}
      aria-pressed={selected}
    >
      <div className={`relative flex h-[178px] flex-col items-center justify-center overflow-hidden bg-gradient-to-b ${glow}`}>
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.45),transparent_36%)]" />
        <TypeIcon className={`absolute right-3 top-3 h-5 w-5 ${accent} opacity-80`} />
        <div className="relative z-10 px-4 text-center">
          <div className="mb-1 font-mono text-[7px] uppercase tracking-[0.45em] text-white/45">
            Arcana {data.tarotRoman}
          </div>
          <div className={`text-sm font-black uppercase italic tracking-widest ${accent}`}>{data.tarotName}</div>
          <div className="mt-3 text-5xl leading-none">{data.emojiArt}</div>
        </div>
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase text-white/45">{data.faction}</span>
          <div className="flex gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${i < data.cost ? 'bg-cyan-300 shadow-[0_0_6px_currentColor]' : 'bg-white/15'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex h-[162px] flex-col justify-between bg-[#111115] p-4">
        <div>
          <div className="flex items-center justify-between">
            <span className={`rounded border border-white/10 bg-white/5 px-2 py-1 text-[9px] font-black uppercase tracking-widest ${accent}`}>
              {data.type}
            </span>
            <span className="font-mono text-[9px] uppercase text-white/35">Cost {data.cost}</span>
          </div>
          <h3 className="mt-2 line-clamp-1 text-base font-black uppercase italic leading-tight tracking-normal text-white">
            {data.name}
          </h3>
          <p className="mt-1 line-clamp-2 font-mono text-[9px] uppercase leading-relaxed text-gray-400">{data.thaiName}</p>
          {data.effect && (
            <p className="mt-2 line-clamp-2 border-t border-white/10 pt-2 font-mono text-[9px] leading-relaxed text-cyan-300/85">
              {data.effect.description}
            </p>
          )}
        </div>

        {isUnit && (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded border border-white/10 bg-white/5 p-2 text-center">
              <div className="text-[7px] font-bold uppercase text-gray-500">ATK</div>
              <div className="text-sm font-black text-cyan-300">
                {atk}
                {hasAtkMod && <span className="ml-1 text-[9px] text-yellow-300">({signed(card.atkMod)})</span>}
              </div>
            </div>
            <div className="rounded border border-white/10 bg-white/5 p-2 text-center">
              <div className="text-[7px] font-bold uppercase text-gray-500">HP / DEF</div>
              <div className="text-sm font-black text-cyan-300">
                {card.currentHp}/{def}
                {hasDefMod && <span className="ml-1 text-[9px] text-yellow-300">({signed(card.defMod)})</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      {card.sick && (
        <div className="absolute inset-0 grid place-items-center bg-zinc-950/55 backdrop-grayscale">
          <span className="rounded-full border border-white/15 bg-black/75 px-3 py-1 font-mono text-[9px] font-black uppercase tracking-widest text-zinc-200">
            Deploying
          </span>
        </div>
      )}

      {(card.taunt || card.silenced) && (
        <div className="absolute left-3 top-3 flex gap-1">
          {card.taunt && !card.silenced && (
            <span className="rounded bg-yellow-300 px-2 py-1 font-mono text-[8px] font-black uppercase tracking-widest text-black">
              Taunt
            </span>
          )}
          {card.silenced && (
            <span className="rounded bg-zinc-200 px-2 py-1 font-mono text-[8px] font-black uppercase tracking-widest text-black">
              Silence
            </span>
          )}
        </div>
      )}
    </motion.button>
  );
}
