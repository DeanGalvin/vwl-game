// The puzzle structure that the backend returns
export interface DailyPuzzle {
  id: number;
  date: string;
  category: string;
  words: string[]; // The obscured words (missing vowels, randomized spacing)
  answers: string[]; // The hashed answers
}

// We will use Vite's environment variables to determine the backend URL
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://missing-vowels-api.vercel.app/api' // Replace with your actual Vercel domain later
  : 'http://localhost:3001/api';

export async function fetchTodayPuzzle(): Promise<DailyPuzzle> {
  const response = await fetch(`${API_BASE_URL}/puzzle/today`);
  if (!response.ok) {
    throw new Error('Failed to fetch the daily puzzle');
  }
  return response.json();
}

// Client-side helper to hash the user's guess exactly exactly the same way the server does
// This uses the Web Crypto API
export async function hashGuess(guess: string): Promise<string> {
  const normalized = guess.toLowerCase().replace(/[^a-z0-9]/g, '');
  const msgUint8 = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
