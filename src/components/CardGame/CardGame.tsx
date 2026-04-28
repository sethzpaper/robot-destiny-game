import React from 'react';
import { useGameState } from '../../game/useGameState';
import GameBoard from './GameBoard';

interface Props {
  onBack: () => void;
}

export default function CardGame({ onBack }: Props) {
  const { state, handleCardClick, handleFieldClick, advance, restart } = useGameState();

  return (
    <div className="relative">
      <button
        onClick={onBack}
        className="absolute top-2 left-2 z-50 bg-gray-800/80 hover:bg-gray-700 text-white text-xs px-3 py-1 rounded border border-gray-600 transition-colors"
      >
        ← กลับ
      </button>
      <GameBoard
        state={state}
        onCardClick={handleCardClick}
        onFieldClick={handleFieldClick}
        onAdvance={advance}
        onRestart={restart}
      />
    </div>
  );
}
