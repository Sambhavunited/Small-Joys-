import { get, list, put } from "@vercel/blob";
import type { Lead } from "@/lib/leads";

// Leads are stored as one private JSON file per lead in Vercel Blob.
// Without a Blob store (local development) they live in memory.

const PREFIX = "leads/";

export function storageKind(): "blob" | "memory" {
  return process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID ? "blob" : "memory";
}

type Cached = { etag: string; lead: Lead };
const g = globalThis as unknown as { __sjMemory?: Map<string, Lead>; __sjCache?: Map<string, Cached> };
const memory = (g.__sjMemory ??= new Map<string, Lead>());
const cache = (g.__sjCache ??= new Map<string, Cached>());

async function readJson(stream: ReadableStream<Uint8Array>) {
  const text = await new Response(stream).text();
  return JSON.parse(text) as Lead;
}

export async function saveLead(lead: Lead): Promise<void> {
  if (storageKind() === "memory") {
    memory.set(lead.id, structuredClone(lead));
    return;
  }
  const pathname = `${PREFIX}${lead.id}.json`;
  const res = await put(pathname, JSON.stringify(lead), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
  });
  cache.set(pathname, { etag: res.etag, lead });
}

export async function getLead(id: string): Promise<Lead | null> {
  if (storageKind() === "memory") {
    const lead = memory.get(id);
    return lead ? structuredClone(lead) : null;
  }
  const pathname = `${PREFIX}${id}.json`;
  const res = await get(pathname, { access: "private", useCache: false });
  if (!res || res.statusCode !== 200) return null;
  const lead = await readJson(res.stream);
  cache.set(pathname, { etag: res.blob.etag, lead });
  return lead;
}

export async function listLeads(limit = 200): Promise<Lead[]> {
  if (storageKind() === "memory") {
    return [...memory.values()]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, limit)
      .map((l) => structuredClone(l));
  }
  const blobs: { pathname: string; uploadedAt: Date; etag: string }[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: PREFIX, limit: 1000, cursor });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor && blobs.length < 5000);

  blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  const recent = blobs.slice(0, limit);

  const leads = await Promise.all(
    recent.map(async (b) => {
      const hit = cache.get(b.pathname);
      if (hit && hit.etag === b.etag) return hit.lead;
      try {
        const res = await get(b.pathname, { access: "private", useCache: false });
        if (!res || res.statusCode !== 200) return null;
        const lead = await readJson(res.stream);
        cache.set(b.pathname, { etag: b.etag, lead });
        return lead;
      } catch (err) {
        console.error("Could not read lead", b.pathname, err);
        return null;
      }
    }),
  );
  return leads.filter((l): l is Lead => Boolean(l)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
