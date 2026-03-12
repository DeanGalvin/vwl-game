export interface DailyPuzzle {
  id: number;
  date: string;
  category: string;
  words: string[];
  answers: string[];
}

const API_BASE_URL = import.meta.env.PROD
  ? 'https://vwl-game-api.vercel.app/api'
  : 'http://localhost:3001/api';

export async function fetchTodayPuzzle(): Promise<DailyPuzzle> {
  const response = await fetch(`${API_BASE_URL}/puzzle/today`);
  if (!response.ok) {
    throw new Error('Failed to fetch the daily puzzle');
  }
  return response.json();
}


