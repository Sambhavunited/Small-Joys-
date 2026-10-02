import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminConfigured, adminCookieOptions, checkPassword, createAdminToken } from "@/lib/admin-auth";
import { readJsonBody } from "@/lib/http";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!adminConfigured()) {
    return NextResponse.json({ error: "The lead inbox isn't set up yet. Add ADMIN_PASSWORD in Vercel." }, { status: 503 });
  }
  if (
    !rateLimit(`admin-login:${clientIp(req)}`, [
      { windowMs: 60_000, max: 5 },
      { windowMs: 3_600_000, max: 30 },
    ])
  ) {
    return NextResponse.json({ error: "Too many attempts. Please wait a minute." }, { status: 429 });
  }
  const body = await readJsonBody(req, 2_000);
  const password = typeof body?.password === "string" ? body.password : "";
  if (!password || !(await checkPassword(password))) {
    return NextResponse.json({ error: "That password isn't right." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, await createAdminToken(), adminCookieOptions);
  return res;
}
