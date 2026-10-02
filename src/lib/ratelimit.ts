// Small in-memory rate limiter. It protects the AI budget from abuse on a
// best-effort basis (each server instance keeps its own counters).

type Bucket = { hits: number[] };
const g = globalThis as unknown as { __sjRate?: Map<string, Bucket> };
const buckets = (g.__sjRate ??= new Map<string, Bucket>());

export function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/** Returns true when the request is allowed. */
export function rateLimit(key: string, limits: { windowMs: number; max: number }[]) {
  const now = Date.now();
  const longest = Math.max(...limits.map((l) => l.windowMs));
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < longest);
  for (const l of limits) {
    const count = bucket.hits.filter((t) => now - t < l.windowMs).length;
    if (count >= l.max) {
      buckets.set(key, bucket);
      return false;
    }
  }
  bucket.hits.push(now);
  buckets.set(key, bucket);
  if (buckets.size > 5000) {
    // Drop the oldest keys so memory stays bounded.
    for (const k of [...buckets.keys()].slice(0, 1000)) buckets.delete(k);
  }
  return true;
}
