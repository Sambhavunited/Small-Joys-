import { isAdmin } from "@/lib/admin-auth";
import { json, readJsonBody } from "@/lib/http";
import { isValidLeadId, type LeadStatus } from "@/lib/leads";
import { getLead, saveLead } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES: LeadStatus[] = ["new", "contacted", "won", "lost"];

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  if (!(await isAdmin())) return json({ error: "Please sign in again." }, 401);
  const { id } = await ctx.params;
  if (!isValidLeadId(id)) return json({ error: "Not found" }, 404);
  const lead = await getLead(id);
  return lead ? json({ lead }) : json({ error: "Not found" }, 404);
}

export async function PATCH(req: Request, ctx: Ctx) {
  if (!(await isAdmin())) return json({ error: "Please sign in again." }, 401);
  const { id } = await ctx.params;
  if (!isValidLeadId(id)) return json({ error: "Not found" }, 404);
  const body = await readJsonBody(req, 10_000);
  if (!body) return json({ error: "Invalid request" }, 400);

  const lead = await getLead(id);
  if (!lead) return json({ error: "Not found" }, 404);
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status as LeadStatus)) return json({ error: "Unknown status" }, 400);
    lead.status = body.status as LeadStatus;
  }
  if (body.adminNotes !== undefined) {
    lead.adminNotes = typeof body.adminNotes === "string" ? body.adminNotes.slice(0, 2000).trim() || undefined : undefined;
  }
  // Admin edits don't count as customer activity, so updatedAt stays put.
  await saveLead(lead);
  return json({ lead });
}
