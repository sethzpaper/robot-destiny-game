import { CardData } from './gameTypes';

const UNITS: CardData[] = [
  {
    id: 'unit_fool',
    name: 'Iron Scout',
    thaiName: 'เหล็กสกาวต์',
    type: 'unit', faction: 'circuit', cost: 1, atk: 2, def: 1,
    flavorText: '"เดินทางด้วยความกล้า ไม่รู้จักกลัว"',
    tarotName: 'The Fool', tarotRoman: '0', emojiArt: '🤖',
  },
  {
    id: 'unit_magician',
    name: 'Data Mage',
    thaiName: 'พ่อมดข้อมูล',
    type: 'unit', faction: 'circuit', cost: 2, atk: 2, def: 2,
    effect: { trigger: 'onPlay', description: 'จั่วไพ่ 1 ใบ', effectId: 'draw1' },
    flavorText: '"ข้อมูลคืออำนาจ"',
    tarotName: 'The Magician', tarotRoman: 'I', emojiArt: '🔮',
  },
  {
    id: 'unit_chariot',
    name: 'Battle Chassis',
    thaiName: 'แชสซีรบ',
    type: 'unit', faction: 'steel', cost: 3, atk: 4, def: 2,
    flavorText: '"แล่นเร็วดั่งสายฟ้า ไม่หยุดยั้ง"',
    tarotName: 'The Chariot', tarotRoman: 'VII', emojiArt: '⚡',
  },
  {
    id: 'unit_strength',
    name: 'Titan Frame',
    thaiName: 'เฟรมไทแทน',
    type: 'unit', faction: 'steel', cost: 3, atk: 3, def: 4,
    flavorText: '"พลังกายคือทุกสิ่ง"',
    tarotName: 'Strength', tarotRoman: 'VIII', emojiArt: '💪',
  },
  {
    id: 'unit_hermit',
    name: 'Lone Sentinel',
    thaiName: 'ผู้เฝ้าโดดเดี่ยว',
    type: 'unit', faction: 'void', cost: 2, atk: 2, def: 3,
    effect: { trigger: 'onPlay', description: 'โจมตีได้ทันที (ไม่มี Summoning Sickness)', effectId: 'haste' },
    flavorText: '"เงาที่ไม่เคยหลับใหล"',
    tarotName: 'The Hermit', tarotRoman: 'IX', emojiArt: '🌙',
  },
  {
    id: 'unit_emperor',
    name: 'Command Fortress',
    thaiName: 'ป้อมบัญชาการ',
    type: 'unit', faction: 'steel', cost: 4, atk: 3, def: 5,
    flavorText: '"ศูนย์กลางแห่งอำนาจสูงสุด"',
    tarotName: 'The Emperor', tarotRoman: 'IV', emojiArt: '🏰',
  },
  {
    id: 'unit_temperance',
    name: 'Coolant Engine',
    thaiName: 'เครื่องยนต์หล่อเย็น',
    type: 'unit', faction: 'plasma', cost: 3, atk: 2, def: 3,
    effect: { trigger: 'onPlay', description: 'ฟื้นฟู HP ผู้เล่น 15 แต้ม', effectId: 'heal15' },
    flavorText: '"สมดุลคือแก่นของชัยชนะ"',
    tarotName: 'Temperance', tarotRoman: 'XIV', emojiArt: '❄️',
  },
  {
    id: 'unit_devil',
    name: 'Dark Processor',
    thaiName: 'โปรเซสเซอร์มืด',
    type: 'unit', faction: 'void', cost: 4, atk: 5, def: 2,
    flavorText: '"อำนาจมืดจากห้วงลึก"',
    tarotName: 'The Devil', tarotRoman: 'XV', emojiArt: '😈',
  },
  {
    id: 'unit_star',
    name: 'Starlight Drone',
    thaiName: 'โดรนแสงดาว',
    type: 'unit', faction: 'plasma', cost: 3, atk: 3, def: 2,
    flavorText: '"ส่องแสงจากห้วงอวกาศ"',
    tarotName: 'The Star', tarotRoman: 'XVII', emojiArt: '✨',
  },
  {
    id: 'unit_sun',
    name: 'Solar Striker',
    thaiName: 'โจมตีพลังงานแสงอาทิตย์',
    type: 'unit', faction: 'plasma', cost: 4, atk: 5, def: 3,
    flavorText: '"พลังแห่งดวงอาทิตย์ในร่างโลหะ"',
    tarotName: 'The Sun', tarotRoman: 'XIX', emojiArt: '☀️',
  },
  {
    id: 'unit_world',
    name: 'Omega Frame',
    thaiName: 'เฟรมโอเมก้า',
    type: 'unit', faction: 'circuit', cost: 6, atk: 6, def: 6,
    flavorText: '"จุดสิ้นสุดและจุดเริ่มต้น"',
    tarotName: 'The World', tarotRoman: 'XXI', emojiArt: '🌐',
  },
];

const PROGRAMS: CardData[] = [
  {
    id: 'prog_crash',
    name: 'System Crash',
    thaiName: 'ระบบล่ม',
    type: 'program', faction: 'circuit', cost: 2,
    effect: { trigger: 'onPlay', description: 'ดีล 5 ดาเมจแก่ยูนิตเป้าหมาย', effectId: 'damage_unit_5' },
    flavorText: '"ERROR: FATAL — ไม่พบคำสั่ง"',
    tarotName: 'The Tower', tarotRoman: 'XVI', emojiArt: '💥',
  },
  {
    id: 'prog_surge',
    name: 'Data Surge',
    thaiName: 'ข้อมูลพุ่ง',
    type: 'program', faction: 'plasma', cost: 3,
    effect: { trigger: 'onPlay', description: 'ดีล 15 ดาเมจโดยตรงแก่คู่ต่อสู้', effectId: 'damage_player_15' },
    flavorText: '"คลื่นข้อมูลขนาดมหึมา"',
    tarotName: 'The Star', tarotRoman: 'XVII', emojiArt: '🌊',
  },
  {
    id: 'prog_repair',
    name: 'Emergency Repair',
    thaiName: 'ซ่อมฉุกเฉิน',
    type: 'program', faction: 'steel', cost: 2,
    effect: { trigger: 'onPlay', description: 'ฟื้นฟู HP ตนเอง 20 แต้ม', effectId: 'heal_self_20' },
    flavorText: '"ซ่อมแล้วสู้ต่อ!"',
    tarotName: 'The Sun', tarotRoman: 'XIX', emojiArt: '🔧',
  },
  {
    id: 'prog_overclock',
    name: 'Overclock',
    thaiName: 'โอเวอร์คล็อก',
    type: 'program', faction: 'plasma', cost: 1,
    effect: { trigger: 'onPlay', description: 'ยูนิตฝ่ายตนเองได้ +3 ATK ในเทิร์นนี้', effectId: 'boost_atk_3' },
    flavorText: '"เกินขีดจำกัดของเครื่องจักร"',
    tarotName: 'Wheel of Fortune', tarotRoman: 'X', emojiArt: '⚙️',
  },
  {
    id: 'prog_network',
    name: 'Network Boost',
    thaiName: 'บูสต์เครือข่าย',
    type: 'program', faction: 'circuit', cost: 1,
    effect: { trigger: 'onPlay', description: 'จั่วไพ่ 2 ใบ', effectId: 'draw2' },
    flavorText: '"ข้อมูลทะลัก สมองล้น"',
    tarotName: 'The Moon', tarotRoman: 'XVIII', emojiArt: '📡',
  },
];

const UPGRADES: CardData[] = [
  {
    id: 'upg_plasma',
    name: 'Plasma Blade',
    thaiName: 'ใบมีดพลาสม่า',
    type: 'upgrade', faction: 'plasma', cost: 1,
    effect: { trigger: 'passive', description: '+3 ATK', effectId: 'stat_atk_3' },
    flavorText: '"คมดั่งความคิดอันแหลมคม"',
    tarotName: 'Ace of Swords', tarotRoman: 'A♠', emojiArt: '⚔️',
  },
  {
    id: 'upg_nano',
    name: 'Nano Armor',
    thaiName: 'เกราะนาโน',
    type: 'upgrade', faction: 'steel', cost: 1,
    effect: { trigger: 'passive', description: '+3 DEF', effectId: 'stat_def_3' },
    flavorText: '"ป้องกันในระดับอะตอม"',
    tarotName: 'Ace of Pentacles', tarotRoman: 'A♦', emojiArt: '🛡️',
  },
  {
    id: 'upg_turbo',
    name: 'Turbo Core',
    thaiName: 'แกนเทอร์โบ',
    type: 'upgrade', faction: 'circuit', cost: 2,
    effect: { trigger: 'passive', description: '+2 ATK และ +2 DEF', effectId: 'stat_atk_2_def_2' },
    flavorText: '"ทั้งหมดในชิพเดียว"',
    tarotName: 'Ace of Wands', tarotRoman: 'A♣', emojiArt: '💠',
  },
];

const CORES: CardData[] = [
  {
    id: 'core_steel',
    name: 'Steel Core',
    thaiName: 'แกนเหล็กกล้า',
    type: 'core', faction: 'steel', cost: 0,
    effect: { trigger: 'onPlay', description: 'พลังงานสูงสุด +1 ถาวร', effectId: 'add_core' },
    flavorText: '"รากฐานของทุกสิ่ง"',
    tarotName: 'Two of Pentacles', tarotRoman: '2♦', emojiArt: '⬡',
  },
  {
    id: 'core_circuit',
    name: 'Circuit Node',
    thaiName: 'โหนดวงจร',
    type: 'core', faction: 'circuit', cost: 0,
    effect: { trigger: 'onPlay', description: 'พลังงานสูงสุด +1 ถาวร', effectId: 'add_core' },
    flavorText: '"กระแสไฟหล่อเลี้ยงทุกชีวิต"',
    tarotName: 'Two of Wands', tarotRoman: '2♣', emojiArt: '🔵',
  },
  {
    id: 'core_plasma',
    name: 'Plasma Cell',
    thaiName: 'เซลล์พลาสม่า',
    type: 'core', faction: 'plasma', cost: 0,
    effect: { trigger: 'onPlay', description: 'พลังงานสูงสุด +1 ถาวร', effectId: 'add_core' },
    flavorText: '"ไฟที่ไม่มีวันดับ"',
    tarotName: 'Two of Cups', tarotRoman: '2♥', emojiArt: '🔴',
  },
  {
    id: 'core_void',
    name: 'Void Shard',
    thaiName: 'เศษกระจกว่าง',
    type: 'core', faction: 'void', cost: 0,
    effect: { trigger: 'onPlay', description: 'พลังงานสูงสุด +1 ถาวร', effectId: 'add_core' },
    flavorText: '"ดึงพลังงานจากความว่างเปล่า"',
    tarotName: 'Two of Swords', tarotRoman: '2♠', emojiArt: '⚫',
  },
];

export const ALL_CARDS: CardData[] = [...UNITS, ...PROGRAMS, ...UPGRADES, ...CORES];

export const CARD_BY_ID = new Map(ALL_CARDS.map((card) => [card.id, card]));

// 40-card starter deck for both players
export function buildStarterDeck(): CardData[] {
  const u = UNITS;
  const p = PROGRAMS;
  const g = UPGRADES;
  const c = CORES;
  return [
    // Units ×14
    u[0], u[0],   // Iron Scout ×2
    u[1], u[1],   // Data Mage ×2
    u[2], u[2],   // Battle Chassis ×2
    u[3], u[3],   // Titan Frame ×2
    u[4], u[4],   // Lone Sentinel ×2
    u[5], u[5],   // Command Fortress ×2
    u[6],         // Coolant Engine ×1
    u[7],         // Dark Processor ×1
    // Programs ×10
    p[0], p[0],   // System Crash ×2
    p[1], p[1],   // Data Surge ×2
    p[2], p[2],   // Emergency Repair ×2
    p[3], p[3],   // Overclock ×2
    p[4], p[4],   // Network Boost ×2
    // Upgrades ×6
    g[0], g[0],   // Plasma Blade ×2
    g[1], g[1],   // Nano Armor ×2
    g[2], g[2],   // Turbo Core ×2
    // Cores ×10
    c[0], c[0], c[0], // Steel Core ×3
    c[1], c[1], c[1], // Circuit Node ×3
    c[2], c[2],       // Plasma Cell ×2
    c[3], c[3],       // Void Shard ×2
  ];
}

export function buildDefaultConstructedDeck(): CardData[] {
  return buildStarterDeck().slice(0, 30);
}

export function buildDeckFromIds(ids?: string[]): CardData[] {
  if (!ids || ids.length === 0) return buildStarterDeck();
  const deck = ids.map((id) => CARD_BY_ID.get(id)).filter((card): card is CardData => Boolean(card));
  return deck.length > 0 ? deck : buildStarterDeck();
}
