import { motion } from 'motion/react';
import { Shield, Sword } from 'lucide-react';
import type { PlayerColor } from '../../types';

interface Props {
  onChoose: (color: PlayerColor) => void;
  onBack: () => void;
}

export default function ColorSelectionView({ onChoose, onBack }: Props) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-16">
      <div className="text-center space-y-4">
        <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase">เลือกทีมของคุณ</h2>
        <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">การเลือกสีจะเปลี่ยน HUD ของคุณ</p>
      </div>

      <div className="flex flex-col md:flex-row gap-12 w-full max-w-4xl">
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => onChoose('blue')}
          className="flex-1 h-80 bg-cyan-900/10 border-4 border-cyan-500/30 rounded-[40px] flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-cyan-500 hover:bg-cyan-500/5 transition-all group"
        >
          <div className="w-24 h-24 bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.4)] group-hover:scale-110 transition-transform">
            <Shield className="w-12 h-12 text-black" />
          </div>
          <span className="text-4xl font-black italic uppercase text-cyan-500">TEAM_BLUE</span>
          <span className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-widest">Tactical Defense Specialists</span>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => onChoose('red')}
          className="flex-1 h-80 bg-red-900/10 border-4 border-red-500/30 rounded-[40px] flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-red-500 hover:bg-red-500/5 transition-all group"
        >
          <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.4)] group-hover:scale-110 transition-transform">
            <Sword className="w-12 h-12 text-black" />
          </div>
          <span className="text-4xl font-black italic uppercase text-red-500">TEAM_RED</span>
          <span className="text-[10px] font-mono text-red-500/50 uppercase tracking-widest">Frontline Assault Squad</span>
        </motion.div>
      </div>

      <button onClick={onBack} className="text-gray-500 hover:text-white transition-colors uppercase text-xs font-black italic">ย้อนกลับ</button>
    </div>
  );
}
