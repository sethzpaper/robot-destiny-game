import { MAX_HP } from './gameTypes';
import type { AiLevel, CardData, CardInstance, EffectTrigger, GameOptions, GameState, PlayerId, PlayerState } from './gameTypes';
import { buildDeckFromIds, buildStarterDeck } from './cardDatabase';
import { getEffectTarget, runEffect } from './effects';

let iidCounter = 0;

export function makeInstance(data: CardData): CardInstance {
  return {
    iid: `${data.id}_${++iidCounter}_${Math.random().toString(36).slice(2, 6)}`,
    data,
    currentHp: data.def ?? 0,
    isTapped: false,
    sick: true,
    atkMod: 0,
    defMod: 0,
    silenced: false,
    taunt: false,
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

function makePlayer(id: PlayerId, name: string, deckData: CardData[]): PlayerState {
  const deck = shuffle(deckData).map(makeInstance);
  const hand = deck.splice(0, 5);
  return { id, name, hp: MAX_HP, cores: 0, energy: 0, playedCore: false, hand, deck, graveyard: [], field: [] };
}

export function initGame(options: GameOptions = {}): GameState {
  const playerState = makePlayer('player', 'Player', buildDeckFromIds(options.playerDeckIds));
  const aiState = makePlayer('ai', 'AI', options.aiDeckIds ? buildDeckFromIds(options.aiDeckIds) : buildStarterDeck());
  return {
    phase: 'draw',
    turn: 1,
    active: 'player',
    player: playerState,
    ai: aiState,
    selectedIid: null,
    attackerIids: [],
    attackTargets: {},
    log: ['[ Game start ] - Player turn 1'],
    winner: null,
    message: 'Draw phase - continue to draw',
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

function other(id: PlayerId): PlayerId {
  return id === 'player' ? 'ai' : 'player';
}

function ownerOf(state: GameState, iid: string): PlayerId | null {
  if (state.player.field.some((card) => card.iid === iid) || state.player.hand.some((card) => card.iid === iid)) return 'player';
  if (state.ai.field.some((card) => card.iid === iid) || state.ai.hand.some((card) => card.iid === iid)) return 'ai';
  return null;
}

export function getAtk(u: CardInstance): number {
  return (u.data.atk ?? 0) + u.atkMod;
}

export function getDef(u: CardInstance): number {
  return (u.data.def ?? 0) + u.defMod;
}

export function drawCard(state: GameState, who?: PlayerId): GameState {
  const id = who ?? state.active;
  const p = getP(state, id);
  if (p.deck.length === 0) {
    const winner = other(id);
    return { ...addLog(state, `${p.name} has no cards left. ${getP(state, winner).name} wins.`), winner, phase: 'gameover' };
  }
  const [drawn, ...rest] = p.deck;
  return setP(addLog(state, `${p.name} draws [${drawn.data.name}]`), { ...p, deck: rest, hand: [...p.hand, drawn] });
}

function runTriggeredEffects(state: GameState, owner: PlayerId, trigger: EffectTrigger, eventSource?: CardInstance): GameState {
  let s = state;
  const p = getP(s, owner);
  for (const source of p.field) {
    if (source.silenced || source.data.effect?.trigger !== trigger) continue;
    s = runEffect({ state: s, source, sourceOwner: owner, targetIid: eventSource?.iid });
  }
  return s;
}

export function startTurn(state: GameState): GameState {
  const p = getP(state, state.active);
  const newField = p.field.map((c) => ({ ...c, isTapped: false, sick: false, atkMod: 0 }));
  const newP = { ...p, field: newField, energy: p.cores + 3, playedCore: false };
  let s = setP(state, newP);
  s = runTriggeredEffects(s, state.active, 'onTurnStart');
  s = runTriggeredEffects(s, state.active, 'whileOnField');
  const skipsDraw = state.turn === 1 && state.active === 'player';
  const message = skipsDraw ? 'Draw phase - first turn, no draw' : 'Draw phase - draw a card';
  return { ...s, phase: 'draw', message, attackerIids: [], attackTargets: {}, selectedIid: null };
}

// The first player skips the draw on turn 1 to offset going first.
export function drawPhase(state: GameState): GameState {
  if (state.phase !== 'draw') return state;
  let s = state;
  if (state.turn === 1 && state.active === 'player') {
    s = addLog(s, `${getP(s, s.active).name} skips the first draw`);
  } else {
    s = drawCard(s);
    if (s.winner) return s;
  }
  return { ...s, phase: 'main1', message: 'Main 1 - play cards' };
}

export function needsTarget(data: CardData): 'friendly' | 'enemy' | 'none' {
  const target = data.effect?.target ?? getEffectTarget(data.effect?.effectId);
  return target === 'friendly' || target === 'enemy' ? target : 'none';
}

export function canPlay(state: GameState, inst: CardInstance): boolean {
  const p = getP(state, state.active);
  if (p.energy < inst.data.cost) return false;
  if (inst.data.type === 'unit' && p.field.length >= 5) return false;
  if (inst.data.type === 'core' && p.playedCore) return false;
  return state.phase === 'main1' || state.phase === 'main2';
}

export function playCard(state: GameState, iid: string, targetIid?: string): GameState {
  const p = getP(state, state.active);
  const idx = p.hand.findIndex((c) => c.iid === iid);
  if (idx < 0 || !canPlay(state, p.hand[idx])) return state;

  const inst = p.hand[idx];
  const newHand = p.hand.filter((_, i) => i !== idx);
  let s = setP(state, { ...p, hand: newHand, energy: p.energy - inst.data.cost });

  switch (inst.data.type) {
    case 'unit': {
      const unitInst = inst.data.effect?.effectId === 'haste' ? { ...inst, sick: false } : inst;
      const updatedP = getP(s, s.active);
      s = setP(addLog(s, `${updatedP.name} deploys [${inst.data.name}]`), { ...updatedP, field: [...updatedP.field, unitInst] });
      if (inst.data.effect?.trigger === 'onPlay') {
        s = runEffect({ state: s, source: unitInst, sourceOwner: state.active, targetIid });
      }
      break;
    }
    case 'program': {
      const updatedP = getP(s, s.active);
      s = setP(addLog(s, `${updatedP.name} runs [${inst.data.name}]`), { ...updatedP, graveyard: [...updatedP.graveyard, inst] });
      if (inst.data.effect?.trigger === 'onPlay') {
        s = runEffect({ state: s, source: inst, sourceOwner: state.active, targetIid });
      }
      break;
    }
    case 'upgrade': {
      if (needsTarget(inst.data) !== 'none' && !targetIid) return state;
      const updatedP = getP(s, s.active);
      s = setP(addLog(s, `${updatedP.name} installs [${inst.data.name}]`), { ...updatedP, graveyard: [...updatedP.graveyard, inst] });
      s = runEffect({ state: s, source: inst, sourceOwner: state.active, targetIid });
      break;
    }
    case 'core': {
      const updatedP = getP(s, s.active);
      s = setP(addLog(s, `${updatedP.name} powers up [${inst.data.name}]`), {
        ...updatedP,
        playedCore: true,
        graveyard: [...updatedP.graveyard, inst],
      });
      s = runEffect({ state: s, source: inst, sourceOwner: state.active });
      break;
    }
  }

  return { ...s, selectedIid: null };
}

function moveDeadToGraveyard(state: GameState, owner: PlayerId): GameState {
  const p = getP(state, owner);
  const dead = p.field.filter((card) => card.currentHp <= 0);
  if (dead.length === 0) return state;
  let s = state;
  for (const unit of dead) {
    s = addLog(s, `${unit.data.name} destroyed`);
    if (unit.data.effect?.trigger === 'onDeath' && !unit.silenced) {
      s = runEffect({ state: s, source: unit, sourceOwner: owner });
    }
  }
  const updated = getP(s, owner);
  return setP(s, {
    ...updated,
    field: updated.field.filter((card) => card.currentHp > 0),
    graveyard: [...updated.graveyard, ...dead],
  });
}

function legalAttackTargets(def: PlayerState): CardInstance[] {
  const taunts = def.field.filter((unit) => unit.taunt && !unit.silenced);
  return taunts.length > 0 ? taunts : def.field;
}

function resolveCombat(state: GameState, attackerId: string, targetId: string | 'direct'): GameState {
  const attOwner = state.active;
  const defOwner = other(attOwner);
  const attPlayer = getP(state, attOwner);
  const defPlayer = getP(state, defOwner);
  const attacker = attPlayer.field.find((c) => c.iid === attackerId);
  if (!attacker) return state;

  let s = runTriggeredEffects(state, attOwner, 'onAttack', attacker);

  if (targetId === 'direct') {
    const def = getP(s, defOwner);
    if (legalAttackTargets(def).length > 0) return s;
    const dmg = getAtk(attacker);
    const hp = Math.max(0, def.hp - dmg);
    s = setP(addLog(s, `${attacker.data.name} attacks direct for ${dmg}`), { ...def, hp });
    const updatedAtt = getP(s, attOwner);
    s = setP(s, { ...updatedAtt, field: updatedAtt.field.map((c) => (c.iid === attackerId ? { ...c, isTapped: true } : c)) });
    return hp <= 0 ? { ...s, winner: attOwner, phase: 'gameover' } : s;
  }

  const target = defPlayer.field.find((c) => c.iid === targetId);
  if (!target) return s;
  const legal = legalAttackTargets(defPlayer);
  if (legal.length > 0 && !legal.some((unit) => unit.iid === targetId)) return s;

  const atkDmg = getAtk(attacker);
  const ctrDmg = getAtk(target);
  s = addLog(s, `${attacker.data.name} [ATK:${atkDmg}] attacks ${target.data.name} [ATK:${ctrDmg}]`);
  s = setP(s, {
    ...getP(s, attOwner),
    field: getP(s, attOwner).field.map((c) => (c.iid === attackerId ? { ...c, currentHp: c.currentHp - ctrDmg, isTapped: true } : c)),
  });
  s = setP(s, {
    ...getP(s, defOwner),
    field: getP(s, defOwner).field.map((c) => (c.iid === targetId ? { ...c, currentHp: c.currentHp - atkDmg } : c)),
  });
  s = moveDeadToGraveyard(s, attOwner);
  s = moveDeadToGraveyard(s, defOwner);
  return s;
}

export function executeAttacks(state: GameState): GameState {
  let s = state;
  for (const attackerId of s.attackerIids) {
    if (s.winner) break;
    const att = getP(s, s.active);
    if (!att.field.some((c) => c.iid === attackerId)) continue;
    const def = getOpp(s, s.active);
    const legalTargets = legalAttackTargets(def);
    const chosen = s.attackTargets[attackerId];
    const target =
      legalTargets.length === 0
        ? 'direct'
        : legalTargets.some((unit) => unit.iid === chosen)
          ? chosen
          : legalTargets.slice().sort((a, b) => a.currentHp - b.currentHp)[0].iid;
    s = resolveCombat(s, attackerId, target);
  }
  return { ...s, attackerIids: [], attackTargets: {} };
}

export function toggleAttacker(state: GameState, iid: string): GameState {
  const p = getP(state, state.active);
  const unit = p.field.find((c) => c.iid === iid);
  if (!unit || unit.isTapped || unit.sick) return state;
  if (state.attackerIids.includes(iid)) {
    const attackTargets = { ...state.attackTargets };
    delete attackTargets[iid];
    return { ...state, attackerIids: state.attackerIids.filter((id) => id !== iid), attackTargets };
  }
  return { ...state, attackerIids: [...state.attackerIids, iid] };
}

export function canBeAttackTarget(state: GameState, targetIid: string): boolean {
  return legalAttackTargets(getOpp(state, state.active)).some((unit) => unit.iid === targetIid);
}

export function setAttackTarget(state: GameState, attackerIid: string, targetIid: string): GameState {
  if (state.phase !== 'order' || !state.attackerIids.includes(attackerIid)) return state;
  if (!canBeAttackTarget(state, targetIid)) return state;
  return { ...state, attackTargets: { ...state.attackTargets, [attackerIid]: targetIid } };
}

// Order-phase click on one of your own units: declare it as an attacker and select it
// for targeting, select an already-declared attacker, or cancel the selected one.
export function chooseAttacker(state: GameState, iid: string): GameState {
  if (state.phase !== 'order') return state;
  if (!state.attackerIids.includes(iid)) {
    const s = toggleAttacker(state, iid);
    if (s === state) return state;
    const hasTargets = legalAttackTargets(getOpp(s, s.active)).length > 0;
    return { ...s, selectedIid: iid, message: hasTargets ? 'Order - click an enemy unit to target' : 'Order - attacks go direct' };
  }
  if (state.selectedIid === iid) {
    return { ...toggleAttacker(state, iid), selectedIid: null, message: 'Order - choose attackers' };
  }
  return { ...state, selectedIid: iid, message: 'Order - click an enemy unit to target' };
}

export function advancePhase(state: GameState): GameState {
  switch (state.phase) {
    case 'draw':
      return drawPhase(state);
    case 'main1':
      return { ...state, phase: 'order', message: 'Order - choose attackers', selectedIid: null };
    case 'order': {
      if (state.attackerIids.length === 0) {
        return { ...state, phase: 'main2', message: 'Main 2 - play more cards', selectedIid: null };
      }
      const s = executeAttacks({ ...state, phase: 'battle' });
      if (s.winner) return s;
      return { ...s, phase: 'main2', message: 'Main 2 - play more cards', selectedIid: null };
    }
    case 'main2': {
      let s = runTriggeredEffects(state, state.active, 'onTurnEnd');
      const nextActive = other(state.active);
      const nextTurn = state.turn + (nextActive === 'player' ? 1 : 0);
      s = addLog(s, `--- ${nextActive === 'player' ? `Player turn ${nextTurn}` : 'AI turn'} ---`);
      s = { ...s, active: nextActive, turn: nextTurn, phase: 'draw', message: `${nextActive} turn`, selectedIid: null, attackerIids: [], attackTargets: {} };
      return startTurn(s);
    }
    default:
      return state;
  }
}

function chooseTargetForEffect(state: GameState, card: CardInstance, owner: PlayerId): string | undefined {
  const targetType = needsTarget(card.data);
  if (targetType === 'enemy') {
    const targets = legalAttackTargets(getP(state, other(owner)));
    return (targets.length > 0 ? targets : getP(state, other(owner)).field).slice().sort((a, b) => a.currentHp - b.currentHp)[0]?.iid;
  }
  if (targetType === 'friendly') {
    return getP(state, owner).field.slice().sort((a, b) => getAtk(b) - getAtk(a))[0]?.iid;
  }
  return undefined;
}

function playAiCards(state: GameState, level: AiLevel): GameState {
  let s = state;
  const reserveEnergy = level === 'hard' && s.ai.hand.some((card) => card.data.type === 'program') ? 1 : 0;
  const core = s.ai.hand.find((card) => card.data.type === 'core' && !s.ai.playedCore);
  if (core && canPlay(s, core)) s = playCard(s, core.iid);

  const hand = () => [...s.ai.hand].filter((card) => canPlay(s, card));
  const sortByLevel = (cards: CardInstance[]) =>
    cards.sort((a, b) => (level === 'easy' ? a.data.cost - b.data.cost : b.data.cost - a.data.cost));

  for (const card of sortByLevel(hand())) {
    if (!canPlay(s, card)) continue;
    if (level === 'hard' && card.data.type === 'unit' && s.ai.energy - card.data.cost < reserveEnergy) continue;
    const target = chooseTargetForEffect(s, card, 'ai');
    if (needsTarget(card.data) !== 'none' && !target) continue;
    s = playCard(s, card.iid, target);
  }
  return s;
}

function chooseHardAttackers(state: GameState): GameState {
  let s: GameState = { ...state, phase: 'order', attackerIids: [], attackTargets: {} };
  const defenders = legalAttackTargets(s.player);
  for (const unit of s.ai.field) {
    if (unit.sick || unit.isTapped) continue;
    if (defenders.length === 0) {
      s = toggleAttacker(s, unit.iid);
      continue;
    }
    const profitable = defenders.find((def) => getAtk(unit) >= def.currentHp && unit.currentHp > getAtk(def));
    const lethal = getAtk(unit) >= s.player.hp;
    if (profitable || lethal) s = toggleAttacker(s, unit.iid);
    if (profitable) s = setAttackTarget(s, unit.iid, profitable.iid);
  }
  return s;
}

export function runAiTurn(state: GameState, level: AiLevel = 'normal'): GameState {
  let s = drawPhase(state);
  if (s.winner) return s;
  s = playAiCards(s, level);
  s = level === 'hard' ? chooseHardAttackers(s) : { ...s, phase: 'order', attackerIids: [], attackTargets: {} };

  if (level !== 'hard') {
    for (const unit of s.ai.field) {
      if (!unit.sick && !unit.isTapped) s = toggleAttacker(s, unit.iid);
      if (level === 'easy' && s.attackerIids.length >= 1) break;
    }
  }

  s = executeAttacks(s);
  if (s.winner) return s;

  s = runTriggeredEffects(s, 'ai', 'onTurnEnd');
  const nextTurn = s.turn + 1;
  s = addLog(s, `--- Player turn ${nextTurn} ---`);
  s = { ...s, active: 'player', turn: nextTurn, phase: 'draw', message: 'Your turn', selectedIid: null, attackerIids: [], attackTargets: {} };
  return startTurn(s);
}
