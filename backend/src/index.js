import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());
// Helper to hash answers so the client can verify without cheating easily.
// We use a simple SHA-256 hash.
function hashAnswer(answer) {
    // Normalize answer to lower case and remove non-alphanumeric chars for forgiving validation
    const normalized = answer.toLowerCase().replace(/[^a-z0-9]/g, '');
    return crypto.createHash('sha256').update(normalized).digest('hex');
}
// Read puzzle data
const rawData = fs.readFileSync(path.join(__dirname, 'data', 'puzzles.json'), 'utf8');
const puzzles = JSON.parse(rawData);
app.get('/api/puzzle/today', (req, res) => {
    // Calculate current date in UTC
    const now = new Date();
    const utcDateStr = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    // Find puzzle for today, or fallback to the first puzzle if not found for testing
    let todayPuzzle = puzzles.find((p) => p.date === utcDateStr);
    if (!todayPuzzle) {
        todayPuzzle = puzzles[0];
    }
    // Hash the answers
    const hashedWords = todayPuzzle.words.map((word) => ({
        original: word, // Temporarily sending original for debugging if you want, but we should strip it eventually. Wait, we should NOT send original.
        hash: hashAnswer(word)
    }));
    // Format the words by removing vowels and randomizing spaces
    const processedWords = todayPuzzle.words.map((word) => {
        // 1. Strip vowels
        const noVowels = word.replace(/[aeiouAEIOU]/g, '');
        // 2. Remove all spaces
        const noSpaces = noVowels.replace(/\s+/g, '');
        // 3. Re-insert spaces randomly
        let randomized = '';
        for (let i = 0; i < noSpaces.length; i++) {
            randomized += noSpaces[i];
            // Insert space randomly (e.g., 20% chance), but not at the very end
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
        answers: todayPuzzle.words.map((w) => hashAnswer(w)) // Array of hashed answers for client validation
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map