import { LogOut, ChevronRight } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const PHASES: { name: string; desc: string }[] = [
  { name: 'Draw', desc: 'จั่วการ์ดและฟื้นฟูพลังงาน' },
  { name: 'Main 1', desc: 'วางยูนิต/ใช้โปรแกรม/ติดอัปเกรด' },
  { name: 'Order', desc: 'เลือกยูนิตที่จะโจมตี แล้วคลิกยูนิตศัตรูเพื่อเลือกเป้า' },
  { name: 'Battle', desc: 'แลกดาเมจ ตรวจสอบความตาย' },
  { name: 'Main 2', desc: 'เล่นการ์ดเพิ่มหลังต่อสู้' },
  { name: 'End', desc: 'จบเทิร์น ส่งสิทธิ์ให้ฝ่ายตรงข้าม' },
];

export default function HowToPlayView({ onBack }: Props) {
  return (
    <div className="flex-1 overflow-y-auto p-12 max-w-4xl mx-auto w-full space-y-16">
      <div className="flex justify-between items-center border-b border-white/10 pb-8">
        <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">วิธีการเล่น</h2>
        <button onClick={onBack} className="p-4 bg-white/5 rounded-full hover:bg-white/10 transition-all">
          <LogOut className="w-6 h-6 rotate-180" />
        </button>
      </div>

      <section className="space-y-8">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-cyan-500 text-black flex items-center justify-center font-black text-2xl italic rounded">01</div>
          <h3 className="text-2xl md:text-3xl font-black italic uppercase">พื้นฐาน</h3>
        </div>
        <p className="text-gray-400 font-mono text-xs leading-relaxed uppercase tracking-widest">
          เด็คมีการ์ด 30 ใบ ผู้เล่นเริ่มด้วย HP 30 และจั่ว 5 ใบ (ผู้เล่นที่เริ่มก่อนไม่จั่วในเทิร์นแรก) ใครทำให้คู่แข่ง HP เหลือ 0 ก่อนคือผู้ชนะ — สนามวางได้ฝ่ายละ 5 ยูนิต
        </p>
        <div className="bg-[#1a1a1e] border border-white/5 rounded-3xl p-8 flex items-center justify-center gap-4 md:gap-8 shadow-2xl flex-wrap">
          <div className="w-20 h-28 md:w-24 md:h-32 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-[10px] text-white/30 uppercase">Hand</div>
          <ChevronRight className="text-gray-700" />
          <div className="w-20 h-28 md:w-24 md:h-32 bg-cyan-500/10 border border-cyan-500 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center justify-center text-[10px] text-cyan-300 uppercase">Field</div>
          <ChevronRight className="text-gray-700" />
          <div className="w-20 h-28 md:w-24 md:h-32 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-center text-[10px] text-red-300 uppercase">Attack</div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-cyan-500 text-black flex items-center justify-center font-black text-2xl italic rounded">02</div>
          <h3 className="text-2xl md:text-3xl font-black italic uppercase">6 เฟสต่อเทิร์น</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {PHASES.map((p, i) => (
            <div key={p.name} className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-2">
              <div className="text-[10px] text-cyan-500 font-black italic">PHASE 0{i + 1}</div>
              <div className="text-base md:text-lg font-black italic uppercase">{p.name}</div>
              <p className="text-[9px] text-gray-500 font-mono uppercase tracking-tighter leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-cyan-500 text-black flex items-center justify-center font-black text-2xl italic rounded">03</div>
          <h3 className="text-2xl md:text-3xl font-black italic uppercase">ประเภทการ์ด</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Unit', desc: 'หน่วยรบที่วางลงสนาม มีค่า ATK/DEF — ติด Summoning Sickness 1 เทิร์น' },
            { name: 'Program', desc: 'การ์ดใช้แล้วทิ้ง สั่งการเอฟเฟกต์ทันที' },
            { name: 'Upgrade', desc: 'ติดให้ยูนิตในสนาม เพิ่มสถานะถาวร' },
            { name: 'Core', desc: 'เพิ่มพลังงานสูงสุด — เล่นได้ 1 ใบต่อเทิร์น' },
          ].map((c) => (
            <div key={c.name} className="p-5 bg-white/5 border border-white/5 rounded-2xl">
              <div className="text-cyan-400 font-black italic uppercase text-sm">{c.name}</div>
              <p className="text-[10px] text-gray-400 font-mono uppercase tracking-tight leading-relaxed mt-2">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
