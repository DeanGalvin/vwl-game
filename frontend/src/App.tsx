import { useState } from 'react';
import { GameBoard } from './components/GameBoard';
import { GuessInput } from './components/GuessInput';
import { useGameState } from './hooks/useGameState';

function App() {
  const { state, submitGuess } = useGameState();
  const [guessState, setGuessState] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  const handleGuessSubmit = async (guess: string) => {
    const isCorrect = await submitGuess(guess);
    setGuessState(isCorrect ? 'correct' : 'incorrect');
    setTimeout(() => setGuessState('idle'), 1000);
  };

  if (state.status === 'loading') {
    return <div className="loading-screen animate-fade-in">Loading Today's Challenge...</div>;
  }

  if (state.status === 'error') {
    return <div className="error-screen animate-fade-in">Failed to load the puzzle. Please check if the backend is running.</div>;
  }

  const score = state.guesses.filter(g => g?.isCorrect).length;

  return (
    <div className="app-container animate-fade-in">
      <header className="game-header">
        <h2>{state.puzzle?.category}</h2>
        <h1>VWL</h1>
        {state.status === 'playing' && (
          <div className="progress-indicator">
            Word {state.currentWordIndex + 1} of 5
          </div>
        )}
      </header>

      <div className={`main-panel glass-panel ${guessState === 'correct' ? 'pulse-correct' : guessState === 'incorrect' ? 'pulse-incorrect' : ''}`}>
        <GameBoard gameState={state} />
        
        {state.status === 'playing' ? (
          <div className="input-section">
            <GuessInput 
              onSubmit={handleGuessSubmit} 
              isAnimating={guessState !== 'idle'}
              disabled={state.status !== 'playing'} 
            />
          </div>
        ) : (
          <div className={`results-section animate-pop ${score === 5 ? 'perfect-score' : ''}`}>
            <h3>{score === 5 ? 'Flawless Victory!' : 'Daily Complete!'}</h3>
            <div className={`score-display ${score === 5 ? 'animate-golden-pulse' : ''}`}>
              <span className="score-number">{score}</span>
              <span className="score-denominator">/ 5</span>
            </div>
            <div className="streaks">
              <p>Current Streak: {state.currentStreak}</p>
              <p>Max Streak: {state.maxStreak}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
