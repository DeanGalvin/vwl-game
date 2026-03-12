import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

function encodeAnswer(answer: string): string {
  return Buffer.from(answer).toString('base64');
}

const rawData = fs.readFileSync(path.join(__dirname, 'data', 'puzzles.json'), 'utf8');
const puzzles = JSON.parse(rawData);

app.get('/api/puzzle/today', (req, res) => {
  const now = new Date();
  const utcDateStr = now.toISOString().split('T')[0];

  let todayPuzzle = puzzles.find((p: any) => p.date === utcDateStr);
  if (!todayPuzzle) {
    todayPuzzle = puzzles[0]; 
  }

  const hashedWords = todayPuzzle.words.map((word: string) => ({
    original: word,
    hash: encodeAnswer(word)
  }));
  
  const processedWords = todayPuzzle.words.map((word: string) => {
    const noVowels = word.replace(/[aeiouAEIOU]/g, '');
    const noSpaces = noVowels.replace(/\s+/g, '');
    
    let randomized = '';
    for (let i = 0; i < noSpaces.length; i++) {
      randomized += noSpaces[i];
      if (Math.random() < 0.20 && i < noSpaces.length - 1) {
        randomized += ' ';
      }
    }
    return randomized;
  });

  res.json({
    id: todayPuzzle.id,
    date: todayPuzzle.date,
    category: todayPuzzle.category,
    words: processedWords,
    answers: todayPuzzle.words.map((w: string) => encodeAnswer(w))
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;
