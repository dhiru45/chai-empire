import express from 'express';
import cors from 'cors';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const STATS_FILE = path.join(DATA_DIR, 'player-stats.json');
const SAVES_FILE = path.join(DATA_DIR, 'player-saves.json');
const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json');

const PORT = Number.parseInt(process.env.PORT ?? '4000', 10);

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

async function ensureStorage() {
  await mkdir(DATA_DIR, { recursive: true });
  await ensureFile(STATS_FILE, {});
  await ensureFile(SAVES_FILE, {});
  await ensureFile(LEADERBOARD_FILE, []);
}

async function ensureFile(filePath, defaultContent) {
  try {
    await readFile(filePath, 'utf-8');
  } catch {
    await writeJson(filePath, defaultContent);
  }
}

async function readJson(filePath, fallback) {
  try {
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, value) {
  await writeFile(filePath, JSON.stringify(value, null, 2), 'utf-8');
}

function validatePlayerStats(payload) {
  if (!isObject(payload)) return 'Body must be a JSON object.';
  const { level, xp, money, reputation, totalServed, totalEarned, day } = payload;
  const numeric = { level, xp, money, reputation, totalServed, totalEarned, day };
  for (const [key, value] of Object.entries(numeric)) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return `${key} must be a valid number.`;
    }
  }
  return null;
}

function normalizeLeaderboardEntry(payload) {
  if (!isObject(payload)) return { error: 'Body must be a JSON object.' };
  const { playerId, name, score, level, date } = payload;
  if (typeof name !== 'string' || !name.trim()) return { error: 'name is required.' };
  if (typeof score !== 'number' || Number.isNaN(score)) return { error: 'score must be a number.' };
  if (typeof level !== 'number' || Number.isNaN(level)) return { error: 'level must be a number.' };
  if (date !== undefined && typeof date !== 'string') return { error: 'date must be a string when provided.' };
  if (playerId !== undefined && typeof playerId !== 'string') {
    return { error: 'playerId must be a string when provided.' };
  }
  return {
    entry: {
      id: randomUUID(),
      playerId: playerId ?? null,
      name: name.trim(),
      score: Math.floor(score),
      level: Math.floor(level),
      date: date ?? new Date().toISOString(),
    },
  };
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'chai-empire-api' });
});

app.get('/api/leaderboard', async (req, res) => {
  const limit = toPositiveInt(req.query.limit, 20);
  const leaderboard = await readJson(LEADERBOARD_FILE, []);
  const sorted = Array.isArray(leaderboard)
    ? [...leaderboard].sort((a, b) => Number(b.score ?? 0) - Number(a.score ?? 0))
    : [];
  res.json({ entries: sorted.slice(0, Math.min(limit, 100)) });
});

app.post('/api/leaderboard', async (req, res) => {
  const normalized = normalizeLeaderboardEntry(req.body);
  if ('error' in normalized) {
    return res.status(400).json({ error: normalized.error });
  }

  const leaderboard = await readJson(LEADERBOARD_FILE, []);
  const next = Array.isArray(leaderboard) ? leaderboard : [];
  next.push(normalized.entry);
  await writeJson(LEADERBOARD_FILE, next);
  return res.status(201).json({ entry: normalized.entry });
});

app.get('/api/players/:playerId/stats', async (req, res) => {
  const statsByPlayer = await readJson(STATS_FILE, {});
  const stats = statsByPlayer[req.params.playerId];
  if (!stats) {
    return res.status(404).json({ error: 'Player stats not found.' });
  }
  return res.json({ playerId: req.params.playerId, stats });
});

app.put('/api/players/:playerId/stats', async (req, res) => {
  const error = validatePlayerStats(req.body);
  if (error) return res.status(400).json({ error });

  const statsByPlayer = await readJson(STATS_FILE, {});
  statsByPlayer[req.params.playerId] = {
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  await writeJson(STATS_FILE, statsByPlayer);
  return res.status(200).json({ playerId: req.params.playerId, stats: statsByPlayer[req.params.playerId] });
});

app.get('/api/players/:playerId/save', async (req, res) => {
  const savesByPlayer = await readJson(SAVES_FILE, {});
  const save = savesByPlayer[req.params.playerId];
  if (!save) {
    return res.status(404).json({ error: 'Cloud save not found.' });
  }
  return res.json({ playerId: req.params.playerId, save });
});

app.put('/api/players/:playerId/save', async (req, res) => {
  if (!isObject(req.body)) {
    return res.status(400).json({ error: 'Body must be a JSON object.' });
  }

  const savesByPlayer = await readJson(SAVES_FILE, {});
  savesByPlayer[req.params.playerId] = {
    state: req.body,
    updatedAt: new Date().toISOString(),
  };
  await writeJson(SAVES_FILE, savesByPlayer);
  return res.status(200).json({ playerId: req.params.playerId, save: savesByPlayer[req.params.playerId] });
});

app.get('/api/game/bootstrap', (_req, res) => {
  res.json({
    serverTime: new Date().toISOString(),
    version: 'v1',
    features: {
      leaderboard: true,
      playerStats: true,
      cloudSave: true,
    },
  });
});

await ensureStorage();

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
