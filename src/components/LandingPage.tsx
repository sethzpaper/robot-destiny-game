import React, { useEffect, useState } from 'react';
import { Tablet, MessageCircle, Phone, MessageSquare, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onStart: () => void;        // → catalog (no login)
  onAdminLogin: () => void;   // → login screen
  onCardGame?: () => void;    // → card game
}

type HealthStatus = 'ok' | 'degraded' | 'down' | 'checking';

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onAdminLogin, onCardGame }) => {
  const [health, setHealth] = useState<HealthStatus>('checking');

  useEffect(() => {
    let alive = true;
    const check = async () => {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 4000);
        const r = await fetch('/api/health', { signal: ctrl.signal });
        clearTimeout(timer);
        if (!r.ok) throw new Error('http');
        const data = await r.json();
        if (!alive) return;
        setHealth(data.ok && data.db ? 'ok' : 'degraded');
      } catch {
        if (alive) setHealth('down');
      }
    };
    check();
    const id = setInterval(check, 30000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const statusConfig = {
    checking: { color: 'bg-gray-400', label: 'กำลังตรวจสอบ' },
    ok:       { color: 'bg-green-500', label: 'ใช้งานได้' },
    degraded: { color: 'bg-yellow-400', label: 'บางส่วนขัดข้อง' },
    down:     { color: 'bg-red-500', label: 'ขัดข้อง' },
  }[health];
  return (
    <div className="min-h-screen bg-spk-blue text-white font-sarabun flex flex-col">
      {/* Navigation */}
      <nav className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tablet className="w-7 h-7" />
          <span className="text-lg font-bold tracking-tight">iPad Check</span>
        </div>

        <div className="flex items-center gap-3">
          <span
            title={`สถานะระบบ: ${statusConfig.label}`}
            className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs font-medium"
          >
            <span className="relative flex w-2.5 h-2.5">
              {health !== 'ok' && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusConfig.color} opacity-75`}></span>
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusConfig.color}`}></span>
            </span>
            {statusConfig.label}
          </span>
          <button
            onClick={onAdminLogin}
            className="flex items-center gap-2 bg-white text-spk-blue px-5 py-2 rounded-xl font-bold text-sm hover:bg-spk-yellow transition-colors cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            เข้าระบบ
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-spk-yellow/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[120px]"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 text-center max-w-4xl"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4 leading-tight flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <img
              src="https://www.spk.ac.th/home/wp-content/uploads/2025/10/spk-logo-png-new-1.png"
              alt="SPK Logo"
              referrerPolicy="no-referrer"
              className="w-16 h-16 md:w-20 md:h-20 inline-block"
            />
            <span className="text-white">ระบบยืมอุปกรณ์</span>
          </h1>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-8 text-spk-yellow leading-tight">
            Apple iPad เพื่อการศึกษา
          </h2>
          <p className="text-base md:text-lg text-white/60 mb-10 max-w-2xl mx-auto">
            ศูนย์ ICT โรงเรียนสารคามพิทยาคม มุ่งเน้นการใช้เทคโนโลยีเพื่อการเรียนรู้ที่ทันสมัย
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={onStart}
              className="bg-spk-yellow text-spk-blue px-10 py-4 rounded-xl font-bold text-base shadow-xl shadow-spk-yellow/20 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              เริ่มต้นใช้งาน
            </button>
            {onCardGame && (
              <button
                onClick={onCardGame}
                className="bg-purple-600 text-white px-10 py-4 rounded-xl font-bold text-base shadow-xl shadow-purple-500/20 hover:scale-105 active:scale-95 transition-transform cursor-pointer border border-purple-400"
              >
                🤖 Steel Robot Destiny
              </button>
            )}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start md:items-center">
          <div className="flex items-start gap-3">
            <img
              src="https://www.spk.ac.th/home/wp-content/uploads/2025/10/spk-logo-png-new-1.png"
              alt="SPK Logo"
              referrerPolicy="no-referrer"
              className="w-10 h-10"
            />
            <div>
              <p className="font-bold text-sm">iPad Check System</p>
              <p className="text-xs text-white/50">โรงเรียนสารคามพิทยาคม</p>
              <div className="flex items-center gap-3 mt-3 text-white/40">
                <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </a>
                <a href="tel:043711585" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:items-center text-sm text-white/70">
            <a href="#" className="hover:text-white transition-colors">ระเบียบการยืม</a>
            <a href="#" className="hover:text-white transition-colors">ติดต่อสอบถาม</a>
          </div>

          <div className="md:text-right text-xs text-white/40">
            <p>© 2026 ศูนย์ ไอซีที โรงเรียนสารคามพิทยาคม</p>
            <p className="mt-1 uppercase tracking-widest text-[10px]">Modern Education Technology</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
