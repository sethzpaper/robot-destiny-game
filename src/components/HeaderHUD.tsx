import { LayoutGrid } from 'lucide-react';
import type { AppView, PlayerColor } from '../types';
import type { GamePhase } from '../game/gameTypes';

interface Props {
  view: AppView;
  onLogoClick: () => void;
  phase?: GamePhase;
  turn?: number;
  color: PlayerColor;
}

const PHASE_LABELS: { id: GamePhase; label: string }[] = [
  { id: 'draw', label: 'Draw' },
  { id: 'main1', label: 'Main1' },
  { id: 'order', label: 'Order' },
  { id: 'battle', label: 'Battle' },
  { id: 'main2', label: 'Main2' },
  { id: 'end', label: 'End' },
];

const PHASE_COLOR: Record<GamePhase, string> = {
  draw: 'text-blue-400',
  main1: 'text-cyan-400',
  order: 'text-yellow-400',
  battle: 'text-red-400',
  main2: 'text-purple-400',
  end: 'text-gray-400',
  gameover: 'text-white',
};

export default function HeaderHUD({ view, onLogoClick, phase, turn, color }: Props) {
  if (view === 'landing') return null;

  return (
    <header className="px-8 h-20 bg-[#0a0a0c]/80 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between z-50 sticky top-0">
      <div className="flex items-center gap-4 cursor-pointer" onClick={onLogoClick}>
        <div className="w-10 h-10 bg-cyan-500 rounded flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
          <LayoutGrid className="text-black w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black italic tracking-tighter leading-none">MECHANICAL_EMPIRE</h1>
          <span className="text-[10px] font-mono text-cyan-500 tracking-[0.3em] uppercase">Card Battle</span>
        </div>
      </div>

      {view === 'arena' && phase && (
        <div className="hidden lg:flex items-center gap-4 bg-white/5 rounded-full px-6 py-2 border border-white/5">
          {PHASE_LABELS.map(({ id, label }) => {
            const active = phase === id;
            return (
              <div
                key={id}
                className={`flex items-center gap-2 text-[10px] uppercase font-black tracking-widest ${active ? PHASE_COLOR[id] : 'text-white/20'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-current shadow-[0_0_8px_currentColor]' : 'bg-white/10'}`} />
                {label}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-4 items-center">
        {view === 'arena' && turn !== undefined && (
          <div className="text-right">
            <div className="text-[9px] font-mono text-white/30 uppercase">Turn</div>
            <div className="text-xs font-black tracking-widest">#{turn.toString().padStart(2, '0')}</div>
          </div>
        )}
        <div className="w-10 h-10 rounded-full border border-white/10 p-0.5">
          <div
            className={`w-full h-full rounded-full bg-gradient-to-tr ${color === 'blue' ? 'from-cyan-500 to-purple-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'from-red-500 to-orange-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'}`}
          />
        </div>
      </div>
    </header>
  );
}
