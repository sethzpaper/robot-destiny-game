import { motion } from 'motion/react';
import { Zap, Play, Info, Layers, Settings as SettingsIcon, LogOut, Boxes } from 'lucide-react';
import type { AppView } from '../../types';
import logoNeon from '../../assets/mechanical-empire-logo-neon.png';

interface Props {
  onNavigate: (view: AppView) => void;
  onExit: () => void;
}

export default function LandingView({ onNavigate, onExit }: Props) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-12 relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em]">
          <Zap className="w-4 h-4 animate-pulse" /> Final Mission
        </div>
        <img
          src={logoNeon}
          alt="Mechanical Empire card battle"
          className="mx-auto w-[min(92vw,760px)] max-h-[34vh] object-contain drop-shadow-[0_0_34px_rgba(34,211,238,0.35)]"
        />
        <p className="text-gray-500 font-mono text-sm max-w-xl mx-auto uppercase tracking-widest leading-relaxed">
          ศึกการ์ดหุ่นยนต์อาร์คานา — ปลดล็อกพลังแห่งทาโรต์ เพื่อครองสมรภูมิเหล็ก
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <button
          onClick={() => onNavigate('colorSelection')}
          className="group relative h-20 bg-cyan-500 text-black rounded-2xl flex items-center justify-center gap-4 hover:bg-white transition-all overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.3)]"
        >
          <Play className="w-6 h-6 fill-current" />
          <span className="text-xl font-black italic tracking-tight uppercase">เริ่มเกม</span>
        </button>

        <button
          onClick={() => onNavigate('howToPlay')}
          className="h-20 border-2 border-white/5 bg-white/5 rounded-2xl flex items-center justify-center gap-4 hover:border-cyan-500/50 transition-all"
        >
          <Info className="w-6 h-6 text-cyan-500" />
          <span className="text-xl font-black italic tracking-tight uppercase">วิธีการเล่น</span>
        </button>

        <button
          onClick={() => onNavigate('showCards')}
          className="h-20 border-2 border-white/5 bg-white/5 rounded-2xl flex items-center justify-center gap-4 hover:border-purple-500/50 transition-all"
        >
          <Layers className="w-6 h-6 text-purple-500" />
          <span className="text-xl font-black italic tracking-tight uppercase">โชว์ไพ่</span>
        </button>

        <button
          onClick={() => onNavigate('deckBuilder')}
          className="h-20 border-2 border-white/5 bg-white/5 rounded-2xl flex items-center justify-center gap-4 hover:border-cyan-500/50 transition-all"
        >
          <Boxes className="w-6 h-6 text-cyan-500" />
          <span className="text-xl font-black italic tracking-tight uppercase">Deck Builder</span>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className="h-20 border-2 border-white/5 bg-white/5 rounded-2xl flex items-center justify-center gap-4 hover:border-yellow-500/50 transition-all"
        >
          <SettingsIcon className="w-6 h-6 text-yellow-500" />
          <span className="text-xl font-black italic tracking-tight uppercase">ตั้งค่า</span>
        </button>

        <button
          onClick={onExit}
          className="h-20 border-2 border-red-500/20 bg-red-500/5 rounded-2xl flex items-center justify-center gap-4 hover:bg-red-500/20 transition-all text-red-500"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-xl font-black italic tracking-tight uppercase">ออกจากเกม</span>
        </button>
      </div>

      <footer className="mt-8 text-[10px] font-mono text-gray-700 uppercase tracking-[0.2em] text-center">
        Mechanical Empire card battle
      </footer>
    </div>
  );
}
