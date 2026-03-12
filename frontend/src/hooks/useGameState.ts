import { useState, useEffect } from 'react';
import { fetchTodayPuzzle, hashGuess } from '../services/puzzleService';
import type { DailyPuzzle } from '../services/puzzleService';

export type GameStatus = 'loading' | 'playing' | 'won' | 'lost' | 'error';

export interface GuessResult {
  guess: string;
  isCorrect: boolean;
}

export interface GameState {
  puzzle: DailyPuzzle | null;
  currentWordIndex: number;
  guesses: GuessResult[]; 
  status: GameStatus;
  currentStreak: number;
  maxStreak: number;
  gamesPlayed: number;
  lastPlayedDate: string | null;
}

const DEFAULT_STATE: GameState = {
  puzzle: null,
  currentWordIndex: 0,
  guesses: [],
  status: 'loading',
  currentStreak: 0,
  maxStreak: 0,
  gamesPlayed: 0,
  lastPlayedDate: null,
};

export function useGameState() {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('missingVowelsState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Reset status if it's playing but they finished it somehow
        return parsed;
      } catch (e) {
        console.error('Failed to parse local storage state', e);
      }
    }
    return DEFAULT_STATE;
  });

  useEffect(() => {
    localStorage.setItem('missingVowelsState', JSON.stringify(state));
  }, [state]);

  const loadDailyPuzzle = async () => {
    try {
      const puzzle = await fetchTodayPuzzle();
      
      if (state.puzzle?.date !== puzzle.date) {
        setState(prev => ({
          ...prev,
          puzzle,
          currentWordIndex: 0,
          guesses: [],
          status: 'playing'
        }));
      } else if (state.status === 'loading') {
         setState(prev => ({
           ...prev,
           puzzle,
           status: prev.currentWordIndex >= 5 ? 'won' : 'playing'
         }));
      }
    } catch (e) {
      setState(prev => ({ ...prev, status: 'error' }));
    }
  };

  useEffect(() => {
    if (state.status === 'loading' || !state.puzzle) {
      loadDailyPuzzle();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitGuess = async (guess: string) => {
    if (!state.puzzle || state.status !== 'playing') return false;

    const currentHash = state.puzzle.answers[state.currentWordIndex];
    const guessHash = await hashGuess(guess);
    const isCorrect = currentHash === guessHash;
    
    const newGuesses = [...state.guesses];
    newGuesses[state.currentWordIndex] = { guess, isCorrect };

    const isGameOver = state.currentWordIndex === state.puzzle.words.length - 1;
    
    setState(prev => {
      let currentStreak = prev.currentStreak;
      let maxStreak = prev.maxStreak;
      let gamesPlayed = prev.gamesPlayed;
      let lastPlayedDate = prev.lastPlayedDate;

      if (isGameOver) {
        gamesPlayed += 1;
        lastPlayedDate = state.puzzle?.date || new Date().toISOString();
        
        // Did they get all 5? (If they skipped, isCorrect is false)
        const allCorrect = newGuesses.every(g => g?.isCorrect);
        if (allCorrect) {
          currentStreak += 1;
          if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else {
          currentStreak = 0;
        }
      }

      return {
        ...prev,
        guesses: newGuesses,
        currentWordIndex: isGameOver ? prev.currentWordIndex : prev.currentWordIndex + 1,
        status: isGameOver ? 'won' : 'playing',
        currentStreak,
        maxStreak,
        gamesPlayed,
        lastPlayedDate
      };
    });
    
    return isCorrect;
  };

  return { state, submitGuess };
}
