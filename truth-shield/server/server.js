import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import analyzeRouter from './routes/analyze.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prefer server/.env, but also support project-root .env as fallback.
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });



const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  })
);
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

app.use('/api/analyze', analyzeRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Truth Shield server running on http://localhost:${PORT}`);
});
