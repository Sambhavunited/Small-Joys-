export const json = (body: unknown, status = 200, headers?: HeadersInit) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers },
  });

/** Read a JSON object body with a size cap. Returns null when the body is missing, too large or not an object. */
export async function readJsonBody(req: Request, maxBytes = 50_000): Promise<Record<string, unknown> | null> {
  try {
    const raw = await req.text();
    if (!raw || raw.length > maxBytes) return null;
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
