import React from 'react';
import { GameState } from '../../game/gameTypes';
import { canPlay, needsTarget } from '../../game/gameEngine';
import CardView from './CardView';

const PHASE_LABELS: Record<string, string> = {
  draw: 'Draw', main1: 'Main 1', order: 'Order', battle: 'Battle', main2: 'Main 2', end: 'End', gameover: 'Game Over',
};
const PHASE_ORDER = ['draw', 'main1', 'order', 'battle', 'main2', 'end'];

interface Props {
  state: GameState;
  onCardClick: (iid: string) => void;
  onFieldClick: (iid: string, owner: 'player' | 'ai') => void;
  onAdvance: () => void;
  onRestart: () => void;
}

export default function GameBoard({ state, onCardClick, onFieldClick, onAdvance, onRestart }: Props) {
  const { player, ai, phase, active, selectedIid, attackerIids, log, winner, message } = state;

  const isPlayerTurn = active === 'player' && !winner;
  const selectedCard = selectedIid ? player.hand.find(c => c.iid === selectedIid) : null;
  const selectedNeedsTarget = selectedCard ? needsTarget(selectedCard.data) : 'none';

  const advanceBtnLabel = () => {
    if (phase === 'main1') return 'Order Phase →';
    if (phase === 'order') return attackerIids.length > 0 ? `โจมตี! (${attackerIids.length} ยูนิต)` : 'ข้าม Battle →';
    if (phase === 'main2') return 'จบเทิร์น →';
    return 'ถัดไป →';
  };

  const showAdvance = isPlayerTurn && (phase === 'main1' || phase === 'order' || phase === 'main2');

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col select-none" style={{ fontFamily: 'monospace' }}>

      {/* Phase bar */}
      <div className="flex items-center gap-1 px-3 py-1 bg-gray-900 border-b border-gray-700 text-xs flex-wrap">
        {PHASE_ORDER.map(p => (
          <span key={p} className={`px-2 py-0.5 rounded font-bold ${phase === p ? 'bg-yellow-500 text-black' : 'text-gray-500'}`}>
            {PHASE_LABELS[p]}
          </span>
        ))}
        <span className="ml-auto text-gray-400">เทิร์น {state.turn}</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main game area */}
        <div className="flex-1 flex flex-col gap-1 p-2 overflow-auto min-w-0">

          {/* AI status bar */}
          <div className="flex items-center gap-3 px-2 py-1 bg-red-950/50 rounded text-xs">
            <span className="font-bold text-red-400">🤖 {ai.name}</span>
            <span>❤️ {ai.hp}/200</span>
            <span>⚡ {ai.cores + 3} E</span>
            <span>📚 {ai.deck.length}</span>
            <span>🃏 {ai.hand.length}</span>
            {active === 'ai' && <span className="ml-auto text-yellow-400 animate-pulse font-bold">กำลังคิด...</span>}
          </div>

          {/* AI hand (face down) */}
          <div className="flex gap-1 flex-wrap justify-center">
            {ai.hand.map(c => <CardView key={c.iid} card={c} faceDown size="sm" />)}
          </div>

          {/* AI field */}
          <div className="flex-1 flex items-center justify-center gap-2 flex-wrap min-h-24 border border-red-900/40 rounded bg-red-950/10 p-1">
            {ai.field.length === 0
              ? <span className="text-red-900/50 text-sm">— สนาม AI ว่าง —</span>
              : ai.field.map(c => (
                <CardView
                  key={c.iid}
                  card={c}
                  size="md"
                  isTapped={c.isTapped}
                  onClick={() => onFieldClick(c.iid, 'ai')}
                />
              ))
            }
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2 py-1">
            <div className="flex-1 border-t border-gray-700" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-gray-500 text-xs px-2">{message}</span>
              {showAdvance && (
                <button
                  onClick={onAdvance}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-1 rounded text-sm transition-colors"
                >
                  {advanceBtnLabel()}
                </button>
              )}
            </div>
            <div className="flex-1 border-t border-gray-700" />
          </div>

          {/* Player field */}
          <div className="flex-1 flex items-center justify-center gap-2 flex-wrap min-h-24 border border-blue-900/40 rounded bg-blue-950/10 p-1">
            {player.field.length === 0
              ? <span className="text-blue-900/50 text-sm">— สนามของคุณว่าง —</span>
              : player.field.map(c => {
                  const isAtt = attackerIids.includes(c.iid);
                  const isTarget = selectedNeedsTarget === 'friendly';
                  return (
                    <CardView
                      key={c.iid}
                      card={c}
                      size="md"
                      isTapped={c.isTapped}
                      isDead={c.currentHp <= 0}
                      isAttacker={isAtt}
                      isSelected={isTarget}
                      onClick={() => onFieldClick(c.iid, 'player')}
                    />
                  );
                })
            }
          </div>

          {/* Player status bar */}
          <div className="flex items-center gap-3 px-2 py-1 bg-blue-950/50 rounded text-xs">
            <span className="font-bold text-blue-400">👤 {player.name}</span>
            <span>❤️ {player.hp}/200</span>
            <span className="text-yellow-300">⚡ {player.energy}/{player.cores + 3} E</span>
            <span>📚 {player.deck.length}</span>
            <span>🗑️ {player.graveyard.length}</span>
          </div>

          {/* Player hand */}
          <div className="flex gap-1 flex-wrap justify-center pb-1">
            {player.hand.map(c => {
              const playable = isPlayerTurn && (phase === 'main1' || phase === 'main2') && canPlay(state, c);
              const isSelThis = selectedIid === c.iid;
              return (
                <div key={c.iid} className="relative">
                  {playable && !isSelThis && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full animate-ping" />
                  )}
                  <CardView
                    card={c}
                    size="md"
                    isSelected={isSelThis}
                    onClick={playable || isSelThis ? () => onCardClick(c.iid) : undefined}
                  />
                  {!playable && isPlayerTurn && (
                    <div className="absolute inset-0 rounded-lg bg-black/40 pointer-events-none" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Combat Log sidebar */}
        <div className="w-48 flex flex-col bg-gray-900 border-l border-gray-700 text-xs">
          <div className="px-2 py-1 bg-gray-800 font-bold text-gray-300 border-b border-gray-700">📜 Log</div>
          <div className="flex-1 overflow-y-auto p-1 space-y-0.5" style={{ maxHeight: 'calc(100vh - 80px)' }}>
            {log.map((entry, i) => (
              <div key={i} className={`leading-snug text-gray-400 ${i === 0 ? 'text-white font-semibold' : ''}`}>
                {entry}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Game Over overlay */}
      {winner && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border-2 border-yellow-500 rounded-2xl p-8 text-center space-y-4 max-w-sm w-full mx-4">
            <div className="text-5xl">{winner === 'player' ? '🏆' : '💀'}</div>
            <h2 className="text-2xl font-black text-yellow-400">
              {winner === 'player' ? 'ผู้เล่นชนะ!' : 'AI ชนะ!'}
            </h2>
            <p className="text-gray-300 text-sm">
              {winner === 'player'
                ? 'ยอดเยี่ยม! ระบบของศัตรูถูกทำลายสมบูรณ์!'
                : 'ระบบของคุณถูก Override... ลองอีกครั้ง!'}
            </p>
            <button
              onClick={onRestart}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-2 rounded-lg transition-colors"
            >
              เริ่มเกมใหม่
            </button>
          </div>
        </div>
      )}

      {/* Selected card tooltip */}
      {selectedCard && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 border border-yellow-400 rounded-lg px-3 py-1.5 text-xs text-yellow-300 z-40 pointer-events-none">
          {selectedNeedsTarget === 'enemy' && '← คลิกยูนิตศัตรูเป็นเป้าหมาย →'}
          {selectedNeedsTarget === 'friendly' && '← คลิกยูนิตของคุณเป็นเป้าหมาย →'}
        </div>
      )}
    </div>
  );
}
