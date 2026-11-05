# Robot Arcana — แผนพัฒนาเกม

โปรเจกต์การ์ดเกมที่ผสมระหว่าง:
- **Engine** จาก `robot-destiny-game` (เดิม) — ระบบเกมเชิงลึก
- **UI/UX** จาก `Robocard-evolution` — ดีไซน์ cyberpunk + framer-motion

---

## สถานะปัจจุบัน (Snapshot)

### สิ่งที่มีแล้ว

**Engine (`src/game/`)** — แข็งแรงพอใช้งานได้
- `gameEngine.ts` — 362 บรรทัด: deck, hand, graveyard, 6 phases (draw/main1/order/battle/main2/end), summoning sickness, AI ตัดสินใจจริง
- `cardDatabase.ts` — 22 Major Arcana มีชื่อไทย, faction (steel/circuit/plasma/void), effect ผูกกับ trigger (`onPlay`, `passive`)
- `gameTypes.ts` — type ครบ: `CardData`, `CardInstance`, `PlayerState`, `GameState`
- `useGameState.ts` — hook ครอบ engine ด้วย useReducer

**UI ฝั่ง Robocard-evolution** — สวยแต่กลไกตื้น
- 6 views: landing / colorSelection / howToPlay / showCards / settings / arena
- ใช้ `framer-motion`, `lucide-react`, สไตล์ neon cyberpunk
- ศัตรูใช้ `Math.random() * 20 + 10` ใน setTimeout (จะถูกแทนด้วย engine จริง)

---

## Phase 1 — ย้าย UI/UX ของ Robocard-evolution มาครอบ Engine

**เป้าหมาย:** ผู้เล่นเข้าเกมแล้วเจอหน้า landing/menu สวย ๆ และในสนามรบยังใช้ engine จริง

### Step 1.1 — เพิ่ม dependency ที่ขาด
- [ ] `motion` (framer-motion v12) — มีแล้ว ตรวจสอบ
- [ ] `lucide-react` — มีแล้ว ตรวจสอบ

### Step 1.2 — ย้าย AppView shell มาเป็น `App.tsx` ใหม่

โครงสร้างใหม่:
```
src/
├─ App.tsx                  ← shell หลัก (จาก Robocard) จัดการ view routing
├─ main.tsx
├─ index.css
├─ types.ts                 ← type สำหรับ UI shell (AppView, GameSettings)
├─ data/
│  └─ cards.ts              ← (ถ้าจำเป็น) สำหรับ "showCards" แต่ปกติใช้จาก game/cardDatabase ได้
├─ game/                    ← engine เดิม คงไว้
│  ├─ gameEngine.ts
│  ├─ cardDatabase.ts
│  ├─ gameTypes.ts
│  └─ useGameState.ts
└─ components/
   ├─ views/
   │  ├─ LandingView.tsx        ← จาก renderLandingPage
   │  ├─ ColorSelectionView.tsx ← จาก renderColorSelection
   │  ├─ HowToPlayView.tsx      ← จาก renderHowToPlay
   │  ├─ ShowCardsView.tsx      ← จาก renderShowCards
   │  └─ SettingsView.tsx       ← จาก renderSettings
   ├─ ArenaView.tsx              ← view ใหม่ ครอบ GameBoard ของ engine
   ├─ HeaderHUD.tsx              ← header สวย ๆ จาก Robocard
   ├─ BackgroundDecor.tsx        ← blur orb + carbon-fiber pattern
   └─ CardGame/                  ← ของเดิม
      ├─ CardView.tsx            ← refactor ให้ใช้สไตล์ Robocard
      ├─ GameBoard.tsx
      └─ CardGame.tsx
```

- [ ] สร้าง `src/types.ts` ใหม่ (ของเดิมโดนลบไปแล้ว) เก็บ `AppView`, `GameSettings`
- [ ] แตก `Robocard-evolution/src/App.tsx` 628 บรรทัด ออกเป็นไฟล์ย่อยตามด้านบน
- [ ] ย้าย background decor + header เป็น component แยก
- [ ] เปลี่ยนปุ่ม "เริ่มเกมส์" ที่หน้า landing ให้พา view ไป `arena`

### Step 1.3 — ออกแบบ ArenaView ใหม่ที่เชื่อมกับ engine จริง

`ArenaView.tsx` คือจุดบรรจบของสองโปรเจกต์ — UI สวยจาก Robocard + state จาก `useGameState`

หลักการ:
- เลิกใช้ `BattleState` ของ Robocard ทั้งหมด (เป็น state จำลอง ไม่ตรงกับ engine)
- ใช้ `useGameState()` ของ engine เป็นแหล่งความจริง
- mapping:
  - `battle.playerHP` → `state.player.hp`
  - `battle.enemyHP` → `state.ai.hp`
  - `battle.playerMana` → `state.player.energy`
  - `battle.phase` → `state.phase` (ระวัง: engine ใช้ตัวเล็ก `'main1'` แต่ Robocard ใช้ `'Main1'`)
  - hand cards → `state.player.hand` (เป็น `CardInstance[]` ไม่ใช่ `Card[]`)
  - log → `state.log`
- ปุ่ม end-phase → `advance()`
- คลิกการ์ด → `handleCardClick(iid)`
- คลิก field → `handleFieldClick(iid, owner)`

- [ ] สร้าง `src/components/ArenaView.tsx` ที่ใช้ `useGameState`
- [ ] ทำ `<CardComponentNeo />` ที่รับ `CardInstance` (ไม่ใช่ `Card` ของเดิม) แต่ render สวยแบบ Robocard
- [ ] วาง field player/ai เป็นแถวบน-ล่าง พร้อม HP bar + mana counter
- [ ] phase indicator + log panel + restart button
- [ ] ลบ `src/components/CardGame/CardGame.tsx` ทิ้งได้ (ใช้ ArenaView แทน)

### Step 1.4 — ปรับ CardView เดิม → สไตล์ Robocard

`Robocard-evolution` มี CardComponent สวย ๆ ที่ render `Card` พร้อม:
- Tarot label
- Cost dots
- Type badge
- ATK/DEF panel
- Hover scale + rotateY

- [ ] ปรับ `CardView.tsx` ให้รับ `CardInstance` (ใช้ `card.data.thaiName`, `card.data.tarotName`, `card.data.atk`, etc.)
- [ ] ใช้ `card.data.emojiArt` ตรงตำแหน่ง art placeholder
- [ ] แสดง currentHp / atkMod / defMod ด้วยถ้ามี modifier
- [ ] state visual: `isTapped` (rotate 90), `sick` (overlay สีเทา), `selected` (glow cyan)

### Step 1.5 — Tailwind + global styling
- [ ] เช็ค `index.css` ว่ามี base + ฟอนต์ที่ Robocard ใช้
- [ ] ตรวจ Tailwind config (v4 plugin) ใช้งานได้
- [ ] (ตัวเลือก) load Google Font 'Inter' หรือ 'Space Grotesk' สำหรับ italic black

**Definition of Done:**
- หน้า landing สวยตาม Robocard
- กดเริ่มเกม → เข้า arena → เล่นจริงด้วย engine (ดราว, เล่นการ์ด, AI ตอบโต้, แพ้/ชนะ)
- ทุก view (howToPlay, showCards, settings) ใช้งานได้

---

## Phase 2 — ปิดช่องว่างของระบบเกม

**เป้าหมาย:** เกมรู้สึก "เต็ม" เล่นซ้ำได้

### Step 2.1 — ขยายฐานข้อมูลการ์ด
ตอนนี้มีแค่ Major Arcana 22 ใบ + ของผสม ๆ
- [ ] เพิ่ม Minor Arcana 56 ใบ (Wands/Cups/Swords/Pentacles × Ace-King) → จับคู่กับ faction
- [ ] เพิ่มการ์ด `program` (instant), `upgrade` (equipment), `core` (resource) ให้ครบ
- [ ] กระจาย rarity (common/rare/epic/legendary) อย่างมีเหตุผลทางเกม

### Step 2.2 — ขยายระบบ effect
ตอนนี้ engine รู้จัก `effectId`: `draw1`, `haste`, `heal15` แค่ไม่กี่ตัว
- [ ] ทำ effect registry: `effects/index.ts` → map effectId → handler `(state, source, target?) => state`
- [ ] effect เพิ่มเติม: `damage_target`, `damage_all_enemies`, `buff_atk`, `buff_def`, `tap`, `untap`, `discard`, `mill`, `revive`, `silence`, `taunt`
- [ ] trigger เพิ่ม: `onDeath`, `onAttack`, `onTurnStart`, `onTurnEnd`, `whileOnField`

### Step 2.3 — Deck builder
- [ ] หน้า DeckBuilder: ดูการ์ดทั้งหมด, สร้าง/แก้ deck
- [ ] กฎ: deck size 30, max 3 ใบต่อการ์ดเดียวกัน
- [ ] เก็บ deck ใน localStorage ก่อน (Phase 4 ค่อยย้ายไป Supabase)

### Step 2.4 — AI ที่ฉลาดขึ้น
ตอนนี้ AI ใน `runAiTurn` น่าจะเล่นแบบ greedy พื้นฐาน
- [ ] เพิ่ม level: easy / normal / hard
- [ ] hard: คำนวณ damage trade ก่อนตัดสินใจโจมตี, เก็บการ์ดสำหรับเทิร์นถัดไป

### Step 2.5 — Tutorial / first-time experience
- [ ] เกมแรกบังคับเข้าโหมด tutorial: ทีละ phase, มี tooltip ชี้
- [ ] เก็บ flag `tutorialCompleted` ใน localStorage

**Definition of Done:**
- มีการ์ด ≥ 60 ใบ มีหลากหลาย effect
- สร้าง deck เองได้ เซฟได้
- AI 3 ระดับ
- ผู้เล่นใหม่เข้าใจวิธีเล่นได้ภายใน 5 นาที

---

## Phase 3 — Polish (เสียง / animation / responsive)

### Step 3.1 — เสียงและดนตรี
- [ ] เพลง BGM landing + arena (royalty-free จาก pixabay/incompetech)
- [ ] SFX: เล่นการ์ด, โจมตี, แพ้/ชนะ, hover, click
- [ ] เคารพ `settings.musicEnabled` / `settings.sfxEnabled`

### Step 3.2 — Combat animation
- [ ] การ์ดเลื่อนจากมือไปสนาม (motion `layoutId`)
- [ ] โจมตี: pulse + screen shake + particle
- [ ] HP bar ลดแบบไหล (animate width)
- [ ] Damage number ลอย (motion exit)

### Step 3.3 — Responsive
- [ ] mobile portrait: hand bar เลื่อนซ้าย-ขวา, field ย่อ
- [ ] tablet: layout 2 คอลัมน์
- [ ] desktop: layout เต็ม

### Step 3.4 — Accessibility
- [ ] keyboard navigation (Tab/Enter/Space)
- [ ] aria-label ครบ
- [ ] respect `prefers-reduced-motion`

---

## Phase 4 — Supabase (Backend ใหม่)

> ตอนนี้ Supabase ยังไม่ได้สร้าง

### Step 4.1 — สร้างโปรเจกต์ Supabase ใหม่
- [ ] เข้า dashboard.supabase.com → New project ชื่อ `robot-arcana`
- [ ] เก็บ `SUPABASE_URL` + `SUPABASE_ANON_KEY` ลง `.env.local`
- [ ] เพิ่ม `@supabase/supabase-js` กลับมาใน `package.json`

### Step 4.2 — Schema

```sql
-- ผู้เล่น
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  avatar_color text default 'cyan',
  total_wins int default 0,
  total_losses int default 0,
  rating int default 1000,
  created_at timestamptz default now()
);

-- เด็ค
create table decks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles on delete cascade,
  name text not null,
  card_ids text[] not null,
  is_active boolean default false,
  created_at timestamptz default now()
);

-- ประวัติการแข่ง
create table matches (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references profiles,
  opponent_type text check (opponent_type in ('ai', 'pvp')),
  ai_difficulty text,
  result text check (result in ('win', 'loss', 'draw')),
  turns int,
  duration_seconds int,
  played_at timestamptz default now()
);

-- การ์ดที่ปลดล็อก (ถ้าจะมีระบบสะสม)
create table user_cards (
  user_id uuid references profiles on delete cascade,
  card_id text not null,
  quantity int default 1,
  primary key (user_id, card_id)
);
```

- [ ] สร้าง schema ตามด้านบน
- [ ] เปิด Row Level Security ทุกตาราง
- [ ] เขียน policy: ผู้ใช้แก้ได้แต่ของตัวเอง, อ่าน leaderboard ได้สาธารณะ

### Step 4.3 — Auth
- [ ] Email/password ก่อน (ทีหลังเพิ่ม Google OAuth)
- [ ] หน้า Sign up / Login (UI สไตล์ cyberpunk)
- [ ] auto-create row ใน `profiles` ตอน sign up (trigger)

### Step 4.4 — เชื่อม deck builder กับ cloud
- [ ] sync deck จาก localStorage → Supabase ตอน login ครั้งแรก
- [ ] โหลด deck จาก cloud ทุกครั้งที่เข้าเกม

### Step 4.5 — บันทึกผลแข่ง + Leaderboard
- [ ] หลังจบเกม insert ลง `matches`, อัปเดต `wins/losses/rating`
- [ ] หน้า Leaderboard: top 100 by rating

**Definition of Done:**
- สมัคร/เข้าสู่ระบบได้
- เด็คอยู่บน cloud
- มี Leaderboard ใช้งานได้

---

## Phase 5 — Multiplayer (PvP) — ตัวเลือก

ถ้าทำถึงตรงนี้คือเกมเริ่มเป็นตัวเป็นตน

### Step 5.1 — Realtime ผ่าน Supabase Realtime
- [ ] ออกแบบ message protocol: `play_card`, `advance_phase`, `attack`, `concede`
- [ ] ใช้ Supabase Channels broadcast actions
- [ ] sync state ฝั่งทั้งคู่ผ่าน deterministic engine (action-replay)

### Step 5.2 — Matchmaking
- [ ] Queue: insert ลงตาราง `matchmaking_queue`, function จับคู่ rating ใกล้กัน
- [ ] สร้าง match → ส่ง channel id ให้สองฝ่าย

### Step 5.3 — Anti-cheat พื้นฐาน
- [ ] Server-side validate action (Supabase Edge Function)
- [ ] Reject move ที่ไม่ valid

---

## Phase 6 — Deploy

### Step 6.1 — Vercel หรือ Netlify
- [ ] เชื่อม repo → auto deploy
- [ ] ตั้ง env vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- [ ] custom domain (ตัวเลือก)

### Step 6.2 — Analytics
- [ ] Plausible หรือ Umami (privacy-friendly)
- [ ] ติดตาม: เริ่มเกม, จบเกม, ซื้อ-ใช้การ์ด, ระยะเวลาเล่นเฉลี่ย

### Step 6.3 — PWA
- [ ] manifest + service worker → ติดตั้งบนมือถือได้
- [ ] offline fallback หน้า landing

---

## ลำดับความสำคัญที่แนะนำ

ถ้ามีเวลาจำกัด ทำตามลำดับนี้:

1. **Phase 1** (3-5 วัน) — เปลี่ยนหน้าตาเกมให้สวย ใช้ engine จริง
2. **Phase 2.1 + 2.2** (2-3 วัน) — เพิ่มการ์ดและ effect ให้รู้สึกครบ
3. **Phase 3.2** (1-2 วัน) — animation combat ทำให้เกมรู้สึกมีชีวิต
4. **Phase 2.3 + 4** (3-5 วัน) — Deck builder + Supabase auth/save
5. **Phase 3.1, 3.3** — เสียง + responsive
6. **Phase 6** (1 วัน) — deploy
7. **Phase 5** — เก็บไว้ทีหลัง ใหญ่และซับซ้อน

---

## Risk / สิ่งที่ต้องระวัง

- **Type mismatch** ระหว่าง Robocard's `Card` (cost/attack/defense ตัวเลขใหญ่ 200) กับ engine's `CardData` (atk/def 1-5) — ตอน Phase 1 ต้องเลือกฝั่งใดฝั่งหนึ่งเป็นหลัก แนะนำใช้ของ engine (เลขเล็ก กลไกชัด)
- **Phase enum case** — engine `'main1'`, Robocard `'Main1'` ต้อง normalize
- **Robocard มี view "colorSelection"** ที่ตั้ง `playerColor` แต่ engine ไม่รู้จัก — ใช้แค่เป็น cosmetic ใน HUD เท่านั้น
- **`AnimatePresence mode="wait"`** ใน App.tsx ทำให้ transition view ดู smooth — ห้ามลืมตอน refactor
- **Supabase RLS** — ถ้าเปิดผิด ผู้เล่นจะเห็น/แก้ deck คนอื่นได้ ทดสอบให้ครบ

---

## Quick Reference — คำสั่งที่ใช้บ่อย

```bash
# dev
npm run dev

# typecheck
npm run lint

# build
npm run build

# preview build
npm run preview
```
