import type { CardInstance, EffectTarget, GameState, PlayerId, PlayerState } from '../gameTypes';

export interface EffectContext {
  state: GameState;
  source: CardInstance;
  sourceOwner: PlayerId;
  targetIid?: string;
  amount?: number;
}

export interface EffectDefinition {
  target: EffectTarget;
  handler: (context: EffectContext) => GameState;
}

function getP(state: GameState, id: PlayerId): PlayerState {
  return id === 'player' ? state.player : state.ai;
}

function setP(state: GameState, p: PlayerState): GameState {
  return p.id === 'player' ? { ...state, player: p } : { ...state, ai: p };
}

function opponent(id: PlayerId): PlayerId {
  return id === 'player' ? 'ai' : 'player';
}

function addLog(state: GameState, msg: string): GameState {
  return { ...state, log: [msg, ...state.log].slice(0, 60) };
}

function findUnitOwner(state: GameState, iid?: string): PlayerId | null {
  if (!iid) return null;
  if (state.player.field.some((card) => card.iid === iid)) return 'player';
  if (state.ai.field.some((card) => card.iid === iid)) return 'ai';
  return null;
}

function updateUnit(state: GameState, iid: string | undefined, update: (unit: CardInstance) => CardInstance): GameState {
  const owner = findUnitOwner(state, iid);
  if (!owner || !iid) return state;
  const p = getP(state, owner);
  return setP(state, { ...p, field: p.field.map((unit) => (unit.iid === iid ? update(unit) : unit)) });
}

function damageUnit(state: GameState, iid: string | undefined, amount: number): GameState {
  const owner = findUnitOwner(state, iid);
  if (!owner || !iid) return state;
  const p = getP(state, owner);
  const target = p.field.find((unit) => unit.iid === iid);
  if (!target) return state;
  const nextHp = target.currentHp - amount;
  let s = addLog(state, `${target.data.name} takes ${amount} damage`);
  if (nextHp <= 0) {
    s = addLog(s, `${target.data.name} destroyed`);
    return setP(s, { ...p, field: p.field.filter((unit) => unit.iid !== iid), graveyard: [...p.graveyard, target] });
  }
  return setP(s, { ...p, field: p.field.map((unit) => (unit.iid === iid ? { ...unit, currentHp: nextHp } : unit)) });
}

function drawCard(state: GameState, who: PlayerId): GameState {
  const p = getP(state, who);
  if (p.deck.length === 0) {
    const winner = opponent(who);
    return { ...addLog(state, `${p.name} has no cards left. ${getP(state, winner).name} wins.`), winner, phase: 'gameover' };
  }
  const [drawn, ...deck] = p.deck;
  return setP(addLog(state, `${p.name} draws [${drawn.data.name}]`), { ...p, deck, hand: [...p.hand, drawn] });
}

function discardFromHand(state: GameState, who: PlayerId, amount: number): GameState {
  const p = getP(state, who);
  const discarded = p.hand.slice(0, amount);
  if (discarded.length === 0) return state;
  return setP(addLog(state, `${p.name} discards ${discarded.length} card(s)`), {
    ...p,
    hand: p.hand.slice(discarded.length),
    graveyard: [...p.graveyard, ...discarded],
  });
}

function millDeck(state: GameState, who: PlayerId, amount: number): GameState {
  const p = getP(state, who);
  const milled = p.deck.slice(0, amount);
  if (milled.length === 0) return state;
  return setP(addLog(state, `${p.name} mills ${milled.length} card(s)`), {
    ...p,
    deck: p.deck.slice(milled.length),
    graveyard: [...p.graveyard, ...milled],
  });
}

function reviveUnit(state: GameState, who: PlayerId): GameState {
  const p = getP(state, who);
  const idx = p.graveyard.findIndex((card) => card.data.type === 'unit');
  if (idx < 0 || p.field.length >= 5) return state;
  const revived = { ...p.graveyard[idx], currentHp: p.graveyard[idx].data.def ?? 1, isTapped: true, sick: true };
  return setP(addLog(state, `${p.name} revives ${revived.data.name}`), {
    ...p,
    field: [...p.field, revived],
    graveyard: p.graveyard.filter((_, i) => i !== idx),
  });
}

const definition = (target: EffectTarget, handler: EffectDefinition['handler']): EffectDefinition => ({ target, handler });

export const effects: Record<string, EffectDefinition> = {
  draw1: definition('none', ({ state, sourceOwner }) => drawCard(state, sourceOwner)),
  draw2: definition('none', ({ state, sourceOwner }) => drawCard(drawCard(state, sourceOwner), sourceOwner)),
  haste: definition('none', ({ state }) => state),
  heal15: definition('none', ({ state, sourceOwner }) => healPlayer(state, sourceOwner, 15)),
  heal_self_20: definition('none', ({ state, sourceOwner }) => healPlayer(state, sourceOwner, 20)),
  damage_player_15: definition('none', ({ state, sourceOwner }) => damagePlayer(state, opponent(sourceOwner), 15, sourceOwner)),
  damage_unit_5: definition('enemy', ({ state, targetIid }) => damageUnit(state, targetIid, 5)),
  boost_atk_3: definition('friendly', ({ state, targetIid }) => buffUnit(state, targetIid, 3, 0)),
  stat_atk_3: definition('friendly', ({ state, targetIid }) => buffUnit(state, targetIid, 3, 0)),
  stat_def_3: definition('friendly', ({ state, targetIid }) => buffUnit(state, targetIid, 0, 3)),
  stat_atk_2_def_2: definition('friendly', ({ state, targetIid }) => buffUnit(state, targetIid, 2, 2)),

  damage_target: definition('enemy', ({ state, targetIid, amount }) => damageUnit(state, targetIid, amount ?? 3)),
  damage_all_enemies: definition('none', ({ state, sourceOwner, amount }) => {
    let s = state;
    for (const unit of getP(s, opponent(sourceOwner)).field) {
      s = damageUnit(s, unit.iid, amount ?? 2);
    }
    return s;
  }),
  buff_atk: definition('friendly', ({ state, targetIid, amount }) => buffUnit(state, targetIid, amount ?? 2, 0)),
  buff_def: definition('friendly', ({ state, targetIid, amount }) => buffUnit(state, targetIid, 0, amount ?? 2)),
  tap: definition('enemy', ({ state, targetIid }) => updateUnit(state, targetIid, (unit) => ({ ...unit, isTapped: true }))),
  untap: definition('friendly', ({ state, targetIid }) => updateUnit(state, targetIid, (unit) => ({ ...unit, isTapped: false }))),
  discard: definition('none', ({ state, sourceOwner, amount }) => discardFromHand(state, opponent(sourceOwner), amount ?? 1)),
  mill: definition('none', ({ state, sourceOwner, amount }) => millDeck(state, opponent(sourceOwner), amount ?? 2)),
  revive: definition('none', ({ state, sourceOwner }) => reviveUnit(state, sourceOwner)),
  silence: definition('enemy', ({ state, targetIid }) =>
    updateUnit(state, targetIid, (unit) => ({ ...unit, silenced: true, atkMod: 0, defMod: 0, taunt: false })),
  ),
  taunt: definition('friendly', ({ state, targetIid }) => updateUnit(state, targetIid, (unit) => ({ ...unit, taunt: true }))),
};

function healPlayer(state: GameState, who: PlayerId, amount: number): GameState {
  const p = getP(state, who);
  const hp = Math.min(200, p.hp + amount);
  return setP(addLog(state, `${p.name} heals ${amount} HP (${hp}/200)`), { ...p, hp });
}

function damagePlayer(state: GameState, who: PlayerId, amount: number, sourceOwner: PlayerId): GameState {
  const p = getP(state, who);
  const hp = Math.max(0, p.hp - amount);
  const s = setP(addLog(state, `${p.name} takes ${amount} damage (${hp} HP left)`), { ...p, hp });
  return hp <= 0 ? { ...s, winner: sourceOwner, phase: 'gameover' } : s;
}

function buffUnit(state: GameState, iid: string | undefined, atk: number, def: number): GameState {
  return updateUnit(state, iid, (unit) => ({
    ...unit,
    atkMod: unit.atkMod + atk,
    defMod: unit.defMod + def,
    currentHp: unit.currentHp + Math.max(0, def),
  }));
}

export function getEffectTarget(effectId?: string): EffectTarget {
  if (!effectId) return 'none';
  return effects[effectId]?.target ?? 'none';
}

export function runEffect(context: EffectContext): GameState {
  if (context.source.silenced) return context.state;
  const effectId = context.source.data.effect?.effectId;
  if (!effectId) return context.state;
  const effect = effects[effectId];
  if (!effect) return context.state;
  return effect.handler({
    ...context,
    amount: context.amount ?? context.source.data.effect?.amount,
  });
}
