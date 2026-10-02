import type { Metadata } from "next";
import { adminConfigured, isAdmin } from "@/lib/admin-auth";
import { agentConfig } from "@/lib/agent/run";
import { alertChannels } from "@/lib/alerts";
import { storageKind } from "@/lib/store";
import { LeadInbox } from "@/components/admin/lead-inbox";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lead inbox",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!adminConfigured()) {
    return (
      <div className="container-page max-w-xl py-20 text-center">
        <h1 className="font-display text-5xl">Lead inbox</h1>
        <p className="mt-4 text-muted">
          The inbox isn&apos;t switched on yet. Add an <code className="rounded bg-paper px-1.5 py-0.5">ADMIN_PASSWORD</code>{" "}
          environment variable in Vercel, then redeploy.
        </p>
      </div>
    );
  }
  if (!(await isAdmin())) {
    return (
      <div className="container-page flex flex-1 items-center py-16">
        <LoginForm />
      </div>
    );
  }
  const alerts = alertChannels();
  return (
    <div className="container-page pt-8 pb-20">
      <LeadInbox setup={{ aiEnabled: agentConfig().enabled, storage: storageKind(), email: alerts.email, push: alerts.push }} />
    </div>
  );
}
