import path from "path";

const RESULT_TTL = 60 * 60 * 24 * 30; // 30 days

// ── Storage backend selection ──────────────────────────────────────────────
const useRedis = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
);

// ── Upstash Redis (Vercel / production) ───────────────────────────────────
async function getRedis() {
  const { Redis } = await import("@upstash/redis");
  return Redis.fromEnv();
}

// ── File system (local dev, no Redis) ─────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), "data", "results");

function ensureDir() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require("fs") as typeof import("fs");
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function fsWrite(id: string, data: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require("fs") as typeof import("fs");
  ensureDir();
  fs.writeFileSync(path.join(DATA_DIR, `${id}.json`), JSON.stringify(data), "utf-8");
}

function fsRead(id: string): unknown | null {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require("fs") as typeof import("fs");
  const p = path.join(DATA_DIR, `${id}.json`);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, "utf-8")); } catch { return null; }
}

// ── Public API (always async) ──────────────────────────────────────────────
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function saveResult(id: string, data: unknown): Promise<void> {
  if (useRedis) {
    const redis = await getRedis();
    await redis.set(`vs:${id}`, JSON.stringify(data), { ex: RESULT_TTL });
  } else {
    fsWrite(id, data);
  }
}

export async function getResult(id: string): Promise<unknown | null> {
  if (useRedis) {
    const redis = await getRedis();
    const raw = await redis.get<string>(`vs:${id}`);
    if (!raw) return null;
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } else {
    return fsRead(id);
  }
}
