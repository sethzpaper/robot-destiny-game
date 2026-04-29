import { LogOut, Volume2, Keyboard, Gamepad2 } from 'lucide-react';
import type { GameSettings } from '../../types';

interface Props {
  settings: GameSettings;
  onChange: (next: GameSettings) => void;
  onBack: () => void;
}

export default function SettingsView({ settings, onChange, onBack }: Props) {
  const toggle = (key: 'musicEnabled' | 'sfxEnabled') => onChange({ ...settings, [key]: !settings[key] });
  const setAiLevel = (aiLevel: GameSettings['aiLevel']) => onChange({ ...settings, aiLevel });

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-12 max-w-5xl mx-auto w-full">
      <div className="w-full flex justify-between items-center border-b border-white/10 pb-8">
        <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">ตั้งค่าระบบ</h2>
        <button onClick={onBack} className="p-4 bg-white/5 rounded-full hover:bg-white/10 transition-all">
          <LogOut className="w-6 h-6 rotate-180" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-8">
          <h3 className="text-2xl font-black italic uppercase flex items-center gap-3">
            <Volume2 className="text-cyan-500" /> ระบบเสียง
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm uppercase text-gray-400">เพลงประกอบ</span>
              <button
                onClick={() => toggle('musicEnabled')}
                className={`w-16 h-8 rounded-full relative transition-all ${settings.musicEnabled ? 'bg-cyan-500' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-black rounded-full transition-all ${settings.musicEnabled ? 'left-9' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm uppercase text-gray-400">เสียงเอฟเฟกต์</span>
              <button
                onClick={() => toggle('sfxEnabled')}
                className={`w-16 h-8 rounded-full relative transition-all ${settings.sfxEnabled ? 'bg-cyan-500' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-black rounded-full transition-all ${settings.sfxEnabled ? 'left-9' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-8">
          <h3 className="text-2xl font-black italic uppercase flex items-center gap-3">
            <Keyboard className="text-purple-500" /> คีย์ลัด
          </h3>
          <div className="space-y-3">
            {Object.entries(settings.keyBindings).map(([key, action]) => (
              <div key={key} className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase">{action}</span>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded font-black text-xs text-white">{key}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
          <h3 className="text-2xl font-black italic uppercase flex items-center gap-3">
            <Gamepad2 className="text-cyan-500" /> AI Level
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(['easy', 'normal', 'hard'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setAiLevel(level)}
                className={`h-14 rounded-lg border text-sm font-black uppercase tracking-widest transition ${
                  settings.aiLevel === level
                    ? 'border-cyan-300 bg-cyan-400 text-black'
                    : 'border-white/10 bg-black/30 text-white/50 hover:border-white/30 hover:text-white'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 bg-[#1a1a1e] border-2 border-dashed border-white/5 rounded-[40px] p-12 flex flex-col md:flex-row items-center justify-around gap-12">
          <div className="flex flex-col items-center gap-4">
            <Keyboard className="w-16 h-16 text-cyan-500/20" />
            <div className="text-center space-y-1">
              <span className="block text-xl font-black italic uppercase">Keyboard</span>
              <span className="text-[10px] font-mono text-gray-500 uppercase">Precision Tactical Control</span>
            </div>
          </div>
          <div className="h-20 w-px bg-white/5 hidden md:block" />
          <div className="flex flex-col items-center gap-4 opacity-40">
            <Gamepad2 className="w-16 h-16 text-purple-500/20" />
            <div className="text-center space-y-1">
              <span className="block text-xl font-black italic uppercase">Gamepad</span>
              <span className="text-[10px] font-mono text-gray-500 uppercase">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
