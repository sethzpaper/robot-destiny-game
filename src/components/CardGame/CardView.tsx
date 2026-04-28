import React from 'react';
import { CardInstance, CardData } from '../../game/gameTypes';
import { getAtk } from '../../game/gameEngine';

const FACTION_STYLE: Record<string, string> = {
  steel:   'from-slate-700 via-slate-800 to-slate-900 border-slate-400',
  circuit: 'from-emerald-700 via-emerald-800 to-emerald-950 border-emerald-400',
  plasma:  'from-orange-600 via-orange-800 to-orange-950 border-orange-400',
  void:    'from-purple-700 via-purple-900 to-gray-950 border-purple-400',
};

const TYPE_BADGE: Record<string, string> = {
  unit:    'bg-blue-500 text-white',
  program: 'bg-red-500 text-white',
  upgrade: 'bg-yellow-500 text-black',
  core:    'bg-green-500 text-white',
};

const TYPE_LABEL: Record<string, string> = {
  unit: 'UNIT', program: 'PROGRAM', upgrade: 'UPGRADE', core: 'CORE',
};

interface Props {
  card: CardInstance | CardData;
  isSelected?: boolean;
  isAttacker?: boolean;
  isTapped?: boolean;
  isDead?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  faceDown?: boolean;
}

function getData(card: CardInstance | CardData): CardData {
  return 'data' in card ? card.data : card as CardData;
}

export default function CardView({ card, isSelected, isAttacker, isTapped, isDead, size = 'md', onClick, faceDown }: Props) {
  const data = getData(card);
  const inst = 'iid' in card ? (card as CardInstance) : null;
  const faction = FACTION_STYLE[data.faction] ?? FACTION_STYLE.steel;

  const dims = size === 'sm'
    ? 'w-16 h-24 text-[8px]'
    : size === 'lg'
    ? 'w-28 h-40 text-[10px]'
    : 'w-20 h-28 text-[9px]';

  if (faceDown) {
    return (
      <div className={`${dims} rounded-lg border-2 border-indigo-400 bg-gradient-to-b from-indigo-900 to-indigo-950 flex items-center justify-center cursor-default select-none`}>
        <div className="text-2xl opacity-60">✦</div>
      </div>
    );
  }

  const ringClass = isSelected
    ? 'ring-4 ring-yellow-400 ring-offset-1'
    : isAttacker
    ? 'ring-4 ring-red-500 ring-offset-1'
    : '';

  const rotateClass = isTapped ? 'rotate-12 opacity-70' : '';
  const deadClass = isDead ? 'opacity-40 grayscale' : '';

  return (
    <div
      onClick={onClick}
      className={`
        ${dims} ${rotateClass} ${deadClass} ${ringClass}
        bg-gradient-to-b ${faction}
        border-2 rounded-lg flex flex-col overflow-hidden
        transition-all duration-200 select-none
        ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/20' : 'cursor-default'}
      `}
    >
      {/* Top row: cost + type badge */}
      <div className="flex items-center justify-between px-1 pt-0.5">
        <span className="font-black text-yellow-300">⚡{data.cost}</span>
        <span className={`${TYPE_BADGE[data.type]} px-0.5 rounded-sm font-bold leading-tight`} style={{ fontSize: '7px' }}>
          {TYPE_LABEL[data.type]}
        </span>
      </div>

      {/* Art area */}
      <div className="flex-1 flex flex-col items-center justify-center py-0.5">
        <div className="text-white/30 font-serif" style={{ fontSize: size === 'lg' ? '10px' : '8px' }}>{data.tarotRoman}</div>
        <div style={{ fontSize: size === 'lg' ? '28px' : '20px' }}>{data.emojiArt}</div>
        <div className="text-white/20 font-serif" style={{ fontSize: '7px' }}>{data.tarotName}</div>
      </div>

      {/* Name */}
      <div className="px-1 text-center leading-tight">
        <div className="text-white font-bold truncate" style={{ fontSize: size === 'lg' ? '10px' : '8px' }}>{data.name}</div>
        <div className="text-white/60 truncate" style={{ fontSize: '7px' }}>{data.thaiName}</div>
      </div>

      {/* Stats bar */}
      {data.type === 'unit' && inst && (
        <div className="flex justify-between px-1 pb-0.5 mt-0.5 border-t border-white/20">
          <span className="text-red-300 font-bold">⚔{getAtk(inst)}</span>
          <span className={inst.currentHp <= 1 ? 'text-red-400 font-bold animate-pulse' : 'text-blue-300 font-bold'}>
            ❤{inst.currentHp}
          </span>
        </div>
      )}
      {data.type === 'unit' && !inst && (
        <div className="flex justify-between px-1 pb-0.5 mt-0.5 border-t border-white/20">
          <span className="text-red-300 font-bold">⚔{data.atk}</span>
          <span className="text-blue-300 font-bold">🛡{data.def}</span>
        </div>
      )}
      {data.type !== 'unit' && data.effect && (
        <div className="px-1 pb-0.5 mt-0.5 border-t border-white/20 text-white/70 leading-tight text-center" style={{ fontSize: '7px' }}>
          {data.effect.description.length > 30 ? data.effect.description.slice(0, 27) + '…' : data.effect.description}
        </div>
      )}
    </div>
  );
}
