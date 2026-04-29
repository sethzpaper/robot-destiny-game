import { LogOut } from 'lucide-react';
import { ALL_CARDS } from '../../game/cardDatabase';
import type { CardData, CardInstance } from '../../game/gameTypes';
import CardView from '../CardGame/CardView';

interface Props {
  onBack: () => void;
}

export default function ShowCardsView({ onBack }: Props) {
  const previewInstance = (card: CardData): CardInstance => ({
    iid: `preview-${card.id}`,
    data: card,
    currentHp: card.def ?? 0,
    isTapped: false,
    sick: false,
    atkMod: 0,
    defMod: 0,
  });

  return (
    <div className="flex-1 flex flex-col p-8 md:p-12 gap-8 h-screen overflow-hidden">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">ข้อมูลการ์ดทั้งหมด</h2>
          <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest">{ALL_CARDS.length} ใบ — ทาโรต์ × หุ่นยนต์</p>
        </div>
        <button onClick={onBack} className="p-4 bg-white/5 rounded-full hover:bg-white/10 transition-all">
          <LogOut className="w-6 h-6 rotate-180" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 justify-items-center pb-8">
          {ALL_CARDS.map((card) => (
            <CardView key={card.id} card={previewInstance(card)} scale={0.85} playable={false} />
          ))}
        </div>
      </div>
    </div>
  );
}
