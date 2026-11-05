import { useReducer, useCallback, useEffect, useRef } from 'react';
import { GameOptions, GameState } from './gameTypes';
import { initGame, startTurn, playCard, toggleAttacker, chooseAttacker, setAttackTarget, advancePhase, runAiTurn, needsTarget } from './gameEngine';

type Action =
  | { type: 'INIT'; options?: GameOptions }
  | { type: 'SET'; state: GameState }
  | { type: 'SELECT'; iid: string | null }
  | { type: 'PLAY_CARD'; iid: string; targetIid?: string }
  | { type: 'TOGGLE_ATTACKER'; iid: string }
  | { type: 'CHOOSE_ATTACKER'; iid: string }
  | { type: 'SET_ATTACK_TARGET'; attackerIid: string; targetIid: string }
  | { type: 'ADVANCE' };

function reducer(state: GameState, action: Action): GameState {
  if (action.type === 'INIT') {
    const init = initGame(action.options);
    return startTurn(init);
  }
  if (action.type === 'SET') return action.state;

  if (state.busy || state.winner) return state;

  switch (action.type) {
    case 'SELECT': return { ...state, selectedIid: action.iid };
    case 'PLAY_CARD': return playCard(state, action.iid, action.targetIid);
    case 'TOGGLE_ATTACKER': return toggleAttacker(state, action.iid);
    case 'CHOOSE_ATTACKER': return chooseAttacker(state, action.iid);
    case 'SET_ATTACK_TARGET': return setAttackTarget(state, action.attackerIid, action.targetIid);
    case 'ADVANCE': return advancePhase(state);
    default: return state;
  }
}

export function useGameState(options: GameOptions = {}) {
  const [state, dispatch] = useReducer(reducer, options, (opts) => startTurn(initGame(opts)));
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Run AI turn after a short delay when it's AI's turn
  useEffect(() => {
    if (state.active !== 'ai' || state.winner || state.busy) return;
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    aiTimerRef.current = setTimeout(() => {
      const nextState = runAiTurn(state, options.aiLevel);
      dispatch({ type: 'SET', state: nextState });
    }, 1200);
    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, [state.active, state.turn, state.winner, options.aiLevel]);

  const selectCard = useCallback((iid: string | null) => dispatch({ type: 'SELECT', iid }), []);
  const advance = useCallback(() => dispatch({ type: 'ADVANCE' }), []);
  const toggleAtt = useCallback((iid: string) => dispatch({ type: 'TOGGLE_ATTACKER', iid }), []);
  const restart = useCallback(() => dispatch({ type: 'INIT', options }), [options]);

  // Handle card play + targeting logic
  const handleCardClick = useCallback((iid: string) => {
    if (state.active !== 'player' || state.winner) return;

    const sel = state.selectedIid;

    // Something is already selected → try to use it
    if (sel) {
      const selCard = [...state.player.hand, ...state.player.field].find(c => c.iid === sel);
      if (!selCard) { dispatch({ type: 'SELECT', iid: null }); return; }

      const targetType = needsTarget(selCard.data);

      // If we're clicking a different hand card → switch selection
      if (state.player.hand.find(c => c.iid === iid)) {
        dispatch({ type: 'SELECT', iid });
        return;
      }

      // Otherwise treat as target
      if (targetType === 'friendly' || targetType === 'enemy') {
        dispatch({ type: 'PLAY_CARD', iid: sel, targetIid: iid });
      } else {
        dispatch({ type: 'SELECT', iid: null });
      }
      return;
    }

    // Nothing selected → select this hand card
    const handCard = state.player.hand.find(c => c.iid === iid);
    if (handCard) {
      // Cards with no target play immediately
      if (needsTarget(handCard.data) === 'none') {
        dispatch({ type: 'PLAY_CARD', iid });
      } else {
        dispatch({ type: 'SELECT', iid });
      }
    }
  }, [state]);

  const handleFieldClick = useCallback((iid: string, owner: 'player' | 'ai') => {
    if (state.active !== 'player' || state.winner) return;

    const sel = state.selectedIid;

    if (state.phase === 'order') {
      if (owner === 'player') {
        dispatch({ type: 'CHOOSE_ATTACKER', iid });
      } else if (sel && state.attackerIids.includes(sel)) {
        dispatch({ type: 'SET_ATTACK_TARGET', attackerIid: sel, targetIid: iid });
      }
      return;
    }

    if (sel && (state.phase === 'main1' || state.phase === 'main2')) {
      const selCard = state.player.hand.find(c => c.iid === sel);
      if (!selCard) { dispatch({ type: 'SELECT', iid: null }); return; }
      const targetType = needsTarget(selCard.data);
      if ((targetType === 'enemy' && owner === 'ai') || (targetType === 'friendly' && owner === 'player')) {
        dispatch({ type: 'PLAY_CARD', iid: sel, targetIid: iid });
      }
    }
  }, [state]);

  return { state, selectCard, advance, toggleAtt, handleCardClick, handleFieldClick, restart };
}
