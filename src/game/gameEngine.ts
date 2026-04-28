import { GameState, CardInstance, CardData, PlayerState, PlayerId, GamePhase } from './gameTypes';
import { buildStarterDeck } from './cardDatabase';

let iidCounter = 0;

function makeInstance(data: CardData): CardInstance {
  return {
    iid: `${data.id}_${++iidCounter}_${Math.random().toString(36).slice(2, 6)}`,
    data,
    currentHp: data.def ?? 0,
    isTapped: false,
    sick: true,
    atkMod: 0,
    defMod: 0,
  };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makePlayer(id: PlayerId, name: string): PlayerState {
  const deck = shuffle(buildStarterDeck()).map(makeInstance);
  const hand = deck.splice(0, 5);
  return { id, name, hp: 200, cores: 0, energy: 0, playedCore: false, hand, deck, graveyard: [] , field: [] };
}

export function initGame(): GameState {
  const playerState = makePlayer('player', 'ผู้เล่น');
  const aiState = makePlayer('ai', 'AI');
  return {
    phase: 'draw',
    turn: 1,
    active: 'player',
    player: playerState,
    ai: aiState,
    selectedIid: null,
    attackerIids: [],
    log: ['[ เกมเริ่มต้น! ] — เทิร์นที่ 1 ของผู้เล่น'],
    winner: null,
    message: 'เฟส Draw — กดปุ่มจั่วไพ่',
    busy: false,
  };
}

export function getP(state: GameState, id: PlayerId): PlayerState {
  return id === 'player' ? state.player : state.ai;
}
export function getOpp(state: GameState, id: PlayerId): PlayerState {
  return id === 'player' ? state.ai : state.player;
}
function setP(state: GameState, p: PlayerState): GameState {
  return p.id === 'player' ? { ...state, player: p } : { ...state, ai: p };
}
function addLog(state: GameState, msg: string): GameState {
  return { ...state, log: [msg, ...state.log].slice(0, 60) };
}

export function getAtk(u: CardInstance): number { return (u.data.atk ?? 0) + u.atkMod; }
export function getDef(u: CardInstance): number { return (u.data.def ?? 0) + u.defMod; }

export function drawCard(state: GameState, who?: PlayerId): GameState {
  const id = who ?? state.active;
  const p = getP(state, id);
  if (p.deck.length === 0) {
    const oppId: PlayerId = id === 'player' ? 'ai' : 'player';
    return { ...addLog(state, `${p.name} ไม่มีไพ่เหลือ! ${getP(state, oppId).name} ชนะ!`), winner: oppId, phase: 'gameover' };
  }
  const [drawn, ...rest] = p.deck;
  return setP(addLog(state, `${p.name} จั่ว [${drawn.data.name}]`), { ...p, deck: rest, hand: [...p.hand, drawn] });
}

export function startTurn(state: GameState): GameState {
  const p = getP(state, state.active);
  // Untap units, remove atkMod (temporary buffs), refresh energy
  const newField = p.field.map(c => ({ ...c, isTapped: false, sick: false, atkMod: 0 }));
  const newP = { ...p, field: newField, energy: p.cores + 3, playedCore: false };
  let s = setP(state, newP);
  s = drawCard(s);
  return { ...s, phase: 'main1', message: 'เฟส Main 1 — เล่นไพ่ได้', attackerIids: [], selectedIid: null };
}

export function needsTarget(data: CardData): 'friendly' | 'enemy' | 'none' {
  const id = data.effect?.effectId ?? '';
  if (id === 'damage_unit_5') return 'enemy';
  if (id === 'boost_atk_3' || id === 'stat_atk_3' || id === 'stat_def_3' || id === 'stat_atk_2_def_2') return 'friendly';
  return 'none';
}

export function canPlay(state: GameState, inst: CardInstance): boolean {
  const p = getP(state, state.active);
  if (p.energy < inst.data.cost) return false;
  if (inst.data.type === 'unit' && p.field.length >= 5) return false;
  if (inst.data.type === 'core' && p.playedCore) return false;
  const mainPhase = state.phase === 'main1' || state.phase === 'main2';
  if (!mainPhase) return false;
  return true;
}

function applyUpgrade(unit: CardInstance, upg: CardInstance): CardInstance {
  const eid = upg.data.effect?.effectId ?? '';
  let { atkMod, defMod, currentHp } = unit;
  if (eid === 'stat_atk_3') atkMod += 3;
  if (eid === 'stat_def_3') { defMod += 3; currentHp += 3; }
  if (eid === 'stat_atk_2_def_2') { atkMod += 2; defMod += 2; currentHp += 2; }
  return { ...unit, atkMod, defMod, currentHp };
}

function applyEffect(state: GameState, eid: string, targetIid?: string): GameState {
  switch (eid) {
    case 'draw1': return drawCard(state);
    case 'draw2': return drawCard(drawCard(state));
    case 'haste': return state; // handled at play time
    case 'heal15': {
      const p = getP(state, state.active);
      const hp = Math.min(200, p.hp + 15);
      return setP(addLog(state, `${p.name} ฟื้นฟู 15 HP (${hp}/200)`), { ...p, hp });
    }
    case 'heal_self_20': {
      const p = getP(state, state.active);
      const hp = Math.min(200, p.hp + 20);
      return setP(addLog(state, `${p.name} ฟื้นฟู 20 HP (${hp}/200)`), { ...p, hp });
    }
    case 'damage_player_15': {
      const opp = getOpp(state, state.active);
      const hp = Math.max(0, opp.hp - 15);
      let s = setP(addLog(state, `Data Surge ดีล 15 ดาเมจแก่ ${opp.name}! (${hp} HP)`), { ...opp, hp });
      if (hp <= 0) return { ...s, winner: state.active, phase: 'gameover' };
      return s;
    }
    case 'damage_unit_5': {
      if (!targetIid) return state;
      const opp = getOpp(state, state.active);
      const idx = opp.field.findIndex(c => c.iid === targetIid);
      if (idx < 0) return state;
      const target = opp.field[idx];
      const newHp = target.currentHp - 5;
      let s = addLog(state, `System Crash ดีล 5 ดาเมจแก่ ${target.data.name}`);
      if (newHp <= 0) {
        s = addLog(s, `${target.data.name} ถูกทำลาย!`);
        return setP(s, { ...opp, field: opp.field.filter((_, i) => i !== idx), graveyard: [...opp.graveyard, target] });
      }
      return setP(s, { ...opp, field: opp.field.map((c, i) => i === idx ? { ...c, currentHp: newHp } : c) });
    }
    case 'boost_atk_3': {
      if (!targetIid) return state;
      const p = getP(state, state.active);
      const idx = p.field.findIndex(c => c.iid === targetIid);
      if (idx < 0) return state;
      const target = p.field[idx];
      return setP(addLog(state, `${target.data.name} ได้ +3 ATK ในเทิร์นนี้`), {
        ...p, field: p.field.map((c, i) => i === idx ? { ...c, atkMod: c.atkMod + 3 } : c)
      });
    }
    default: return state;
  }
}

export function playCard(state: GameState, iid: string, targetIid?: string): GameState {
  const p = getP(state, state.active);
  const idx = p.hand.findIndex(c => c.iid === iid);
  if (idx < 0 || !canPlay(state, p.hand[idx])) return state;

  const inst = p.hand[idx];
  const newHand = p.hand.filter((_, i) => i !== idx);
  let newP = { ...p, hand: newHand, energy: p.energy - inst.data.cost };
  let s = setP(state, newP);

  switch (inst.data.type) {
    case 'unit': {
      const unitInst = inst.data.effect?.effectId === 'haste' ? { ...inst, sick: false } : inst;
      const updatedP = getP(s, s.active);
      s = setP(addLog(s, `${p.name} เรียก [${inst.data.name}] ออกสนาม!`), { ...updatedP, field: [...updatedP.field, unitInst] });
      s = applyEffect(s, inst.data.effect?.effectId ?? '');
      break;
    }
    case 'program': {
      const updatedP = getP(s, s.active);
      s = setP(s, { ...updatedP, graveyard: [...updatedP.graveyard, inst] });
      s = addLog(s, `${p.name} ใช้ [${inst.data.name}]!`);
      s = applyEffect(s, inst.data.effect?.effectId ?? '', targetIid);
      break;
    }
    case 'upgrade': {
      if (!targetIid) return state;
      const updatedP = getP(s, s.active);
      const tidx = updatedP.field.findIndex(c => c.iid === targetIid);
      if (tidx < 0) return state;
      const upgraded = applyUpgrade(updatedP.field[tidx], inst);
      s = setP(addLog(s, `${p.name} ติด [${inst.data.name}] กับ ${updatedP.field[tidx].data.name}`), {
        ...updatedP,
        field: updatedP.field.map((c, i) => i === tidx ? upgraded : c),
        graveyard: [...updatedP.graveyard, inst],
      });
      break;
    }
    case 'core': {
      const updatedP = getP(s, s.active);
      s = setP(addLog(s, `${p.name} วาง [${inst.data.name}] — พลังงานสูงสุด +1`), {
        ...updatedP,
        cores: updatedP.cores + 1,
        energy: updatedP.energy + 1,
        playedCore: true,
        graveyard: [...updatedP.graveyard, inst],
      });
      break;
    }
  }

  return { ...s, selectedIid: null };
}

function resolveCombat(state: GameState, attackerId: string, targetId: string | 'direct'): GameState {
  const attOwner = state.active;
  const defOwner: PlayerId = state.active === 'player' ? 'ai' : 'player';
  let attPlayer = getP(state, attOwner);
  let defPlayer = getP(state, defOwner);

  const attIdx = attPlayer.field.findIndex(c => c.iid === attackerId);
  if (attIdx < 0) return state;
  const attacker = attPlayer.field[attIdx];

  if (targetId === 'direct') {
    const dmg = getAtk(attacker);
    const newHp = Math.max(0, defPlayer.hp - dmg);
    let s = addLog(state, `${attacker.data.name} โจมตีตรง → ${defPlayer.name} เสีย ${dmg} HP! (${newHp} HP เหลือ)`);
    s = setP(s, { ...defPlayer, hp: newHp });
    const updatedAtt = getP(s, attOwner);
    s = setP(s, { ...updatedAtt, field: updatedAtt.field.map((c, i) => i === attIdx ? { ...c, isTapped: true } : c) });
    if (newHp <= 0) return { ...s, winner: attOwner, phase: 'gameover' };
    return s;
  }

  const defIdx = defPlayer.field.findIndex(c => c.iid === targetId);
  if (defIdx < 0) return state;
  const defender = defPlayer.field[defIdx];

  const atkDmg = getAtk(attacker);
  const ctrDmg = getAtk(defender);
  const newAttHp = attacker.currentHp - ctrDmg;
  const newDefHp = defender.currentHp - atkDmg;

  let s = addLog(state, `${attacker.data.name} [ATK:${atkDmg}] ⚔️  ${defender.data.name} [ATK:${ctrDmg}]`);

  const tappedAtt = { ...attacker, currentHp: newAttHp, isTapped: true };
  let newAttField = attPlayer.field.map((c, i) => i === attIdx ? tappedAtt : c);
  if (newAttHp <= 0) {
    s = addLog(s, `${attacker.data.name} ถูกทำลาย!`);
    newAttField = newAttField.filter((_, i) => i !== attIdx);
  }

  const hitDef = { ...defender, currentHp: newDefHp };
  let newDefField = defPlayer.field.map((c, i) => i === defIdx ? hitDef : c);
  if (newDefHp <= 0) {
    s = addLog(s, `${defender.data.name} ถูกทำลาย!`);
    newDefField = newDefField.filter((_, i) => i !== defIdx);
  }

  s = setP(s, { ...attPlayer, field: newAttField });
  s = setP(s, { ...defPlayer, field: newDefField });
  return s;
}

export function executeAttacks(state: GameState): GameState {
  let s = state;
  for (const attackerId of s.attackerIids) {
    if (s.winner) break;
    const att = getP(s, s.active);
    if (!att.field.some(c => c.iid === attackerId)) continue;
    const def = getOpp(s, s.active);
    const target = def.field.length === 0 ? 'direct' : def.field.slice().sort((a, b) => a.currentHp - b.currentHp)[0].iid;
    s = resolveCombat(s, attackerId, target);
  }
  return { ...s, attackerIids: [] };
}

export function toggleAttacker(state: GameState, iid: string): GameState {
  const p = getP(state, state.active);
  const unit = p.field.find(c => c.iid === iid);
  if (!unit || unit.isTapped || unit.sick) return state;
  const already = state.attackerIids.includes(iid);
  return { ...state, attackerIids: already ? state.attackerIids.filter(id => id !== iid) : [...state.attackerIids, iid] };
}

export function advancePhase(state: GameState): GameState {
  switch (state.phase) {
    case 'main1': return { ...state, phase: 'order', message: 'เฟส Order — เลือกยูนิตที่จะโจมตี', selectedIid: null };
    case 'order': {
      if (state.attackerIids.length === 0) {
        return { ...state, phase: 'main2', message: 'เฟส Main 2 — เล่นไพ่เพิ่มเติมได้', selectedIid: null };
      }
      let s = executeAttacks({ ...state, phase: 'battle' });
      if (s.winner) return s;
      return { ...s, phase: 'main2', message: 'เฟส Main 2 — เล่นไพ่เพิ่มเติมได้', selectedIid: null };
    }
    case 'main2': {
      // End turn: switch active player
      const nextActive: PlayerId = state.active === 'player' ? 'ai' : 'player';
      const nextTurn = state.turn + (nextActive === 'player' ? 1 : 0);
      const nextLabel = nextActive === 'player' ? `ผู้เล่น (เทิร์น ${nextTurn})` : 'AI';
      let s = addLog(state, `--- เทิร์นของ ${nextLabel} ---`);
      s = { ...s, active: nextActive, turn: nextTurn, phase: 'draw', message: `เทิร์น ${nextActive}`, selectedIid: null, attackerIids: [] };
      s = startTurn(s);
      return s;
    }
    default: return state;
  }
}

// ─── AI ───────────────────────────────────────────────────────────────────────

export function runAiTurn(state: GameState): GameState {
  let s = state;

  // Play core first
  const core = s.ai.hand.find(c => c.data.type === 'core' && !s.ai.playedCore);
  if (core && canPlay(s, core)) s = playCard(s, core.iid);

  // Play units by cost desc
  const units = [...s.ai.hand].filter(c => c.data.type === 'unit').sort((a, b) => b.data.cost - a.data.cost);
  for (const u of units) {
    if (canPlay(s, u)) s = playCard(s, u.iid);
  }

  // Play programs (no target or pick first enemy unit)
  const progs = s.ai.hand.filter(c => c.data.type === 'program');
  for (const pg of progs) {
    if (!canPlay(s, pg)) continue;
    const eid = pg.data.effect?.effectId ?? '';
    if (eid === 'damage_unit_5' && s.player.field.length > 0) {
      const target = s.player.field.slice().sort((a, b) => a.currentHp - b.currentHp)[0];
      s = playCard(s, pg.iid, target.iid);
    } else if (eid !== 'damage_unit_5' && eid !== 'boost_atk_3') {
      s = playCard(s, pg.iid);
    } else if (eid === 'boost_atk_3' && s.ai.field.length > 0) {
      const bestUnit = s.ai.field.slice().sort((a, b) => getAtk(b) - getAtk(a))[0];
      s = playCard(s, pg.iid, bestUnit.iid);
    }
  }

  // Declare all valid attackers
  s = { ...s, phase: 'order' };
  for (const u of s.ai.field) {
    if (!u.sick && !u.isTapped) s = toggleAttacker(s, u.iid);
  }

  // Execute battle
  s = executeAttacks(s);
  if (s.winner) return s;

  // End AI turn → switch to player
  const nextTurn = s.turn + 1;
  s = addLog(s, `--- เทิร์นที่ ${nextTurn} ของผู้เล่น ---`);
  s = { ...s, active: 'player', turn: nextTurn, phase: 'draw', message: 'เทิร์นของคุณ', selectedIid: null, attackerIids: [] };
  s = startTurn(s);
  return s;
}
