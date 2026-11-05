# Robot Arcana

เกมการ์ดแบบผลัดกันเล่น ธีมหุ่นยนต์ผสมไพ่ทาโรต์ ผู้เล่นสู้กับ AI (easy / normal / hard)
และจัดเด็คของตัวเองได้

สร้างด้วย React 19 + TypeScript + Vite + Tailwind CSS v4 + motion

## วิธีรัน

ต้องมี Node.js

```bash
npm install
npm run dev        # เปิดที่ http://localhost:3000
npm run lint       # ตรวจ type
npm run build      # build ไปที่ dist/
```

ไม่ต้องตั้งค่า environment variable ใด ๆ

## กติกาโดยย่อ

- เด็ค 30 ใบ (ซ้ำได้ไม่เกิน 3 ใบต่อการ์ด) เริ่มด้วย HP 30 และการ์ดในมือ 5 ใบ
- ผู้เล่นที่เริ่มก่อนไม่จั่วการ์ดในเทิร์นแรก
- แต่ละเทิร์นมีเฟส: **Draw → Main 1 → Order → Battle → Main 2**
- Energy ต่อเทิร์นเท่ากับ Core + 3 และลงการ์ด Core ได้เทิร์นละ 1 ใบ
- ลงยูนิตในสนามได้สูงสุด 5 ตัว ยูนิตที่เพิ่งลงสนามโจมตีไม่ได้ในเทิร์นนั้น (summoning sickness)
- เฟส Order: คลิกยูนิตของเราเพื่อประกาศโจมตี แล้วคลิกยูนิตศัตรูเพื่อเลือกเป้า
  ถ้าไม่เลือก ระบบจะเลือกยูนิตที่ HP ต่ำสุดให้ ถ้าศัตรูไม่มียูนิตในสนาม จะโจมตีผู้เล่นโดยตรง
  และถ้าศัตรูมียูนิต Taunt ต้องโจมตียูนิตนั้นก่อน
- ฝ่ายที่ HP เหลือ 0 หรือต้องจั่วแต่เด็คหมด จะแพ้

## โครงสร้างโค้ด

| ที่อยู่ | หน้าที่ |
|---|---|
| `src/game/gameTypes.ts` | ชนิดข้อมูลและค่าคงที่ (`MAX_HP`) |
| `src/game/cardDatabase.ts` | ข้อมูลการ์ดทั้งหมดและเด็คเริ่มต้น |
| `src/game/gameEngine.ts` | กฎเกม เฟส การต่อสู้ และ AI (เป็น pure function ไม่ผูกกับ UI) |
| `src/game/effects/index.ts` | ตาราง `effectId` → handler |
| `src/game/useGameState.ts` | hook ที่เชื่อม engine กับ React |
| `src/game/deckStorage.ts` | บันทึกเด็คลง localStorage |
| `src/components/` | หน้าจอต่าง ๆ (landing, deck builder, arena ฯลฯ) |

แผนพัฒนาต่ออยู่ใน [DEV_PLAN.md](DEV_PLAN.md)
