import React from 'react';
import type { GameState } from '../hooks/useGameState';

interface GameBoardProps {
  gameState: GameState;
}

export const GameBoard: React.FC<GameBoardProps> = ({ gameState }) => {
  if (!gameState.puzzle) return null;

  return (
    <div className="game-board">
      {gameState.puzzle.words.map((obscuredWord, index) => {
        const isActive = index === gameState.currentWordIndex && gameState.status === 'playing';
        const isPast = index < gameState.currentWordIndex || gameState.status === 'won';
        const guessObj = gameState.guesses[index];

        let rowClass = 'word-row';
        if (isActive) rowClass += ' active-row animate-pop';
        if (isPast) {
          rowClass += ' past-row';
          if (guessObj?.isCorrect) rowClass += ' correct-row';
          else rowClass += ' incorrect-row';
        }

        return (
          <div key={index} className={rowClass}>
            <div className="word-number">{index + 1}</div>
            <div className="word-content">
              {isActive ? (
                   <div className="obscured-wrapper">
                     <span className="obscured-text">{obscuredWord}</span>
                   </div>
              ) : isPast ? (
                  <div className="result-wrapper">
                    <span className="original-text">{guessObj?.guess || 'SKIPPED'}</span>
                    {guessObj?.isCorrect ? (
                      <span className="icon success-icon">✓</span>
                    ) : (
                      <span className="icon error-icon">✗</span>
                    )}
                  </div>
              ) : (
                  <span className="locked-text">???</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
