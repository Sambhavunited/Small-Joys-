"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LockKeyhole } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Couldn't sign in. Please try again.");
        return;
      }
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-sm rounded-[1.75rem] bg-paper p-7 shadow-lift ring-1 ring-line">
      <span className="flex size-12 items-center justify-center rounded-full bg-cream text-burgundy">
        <LockKeyhole className="size-5" aria-hidden="true" />
      </span>
      <h1 className="mt-4 font-display text-4xl">Lead inbox</h1>
      <p className="mt-1 text-sm text-muted">For the Small Joys team only.</p>
      <label htmlFor="admin-password" className="label mt-6">
        Password
      </label>
      <input
        id="admin-password"
        type="password"
        autoComplete="current-password"
        className="field"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "admin-error" : undefined}
      />
      {error ? (
        <p id="admin-error" role="alert" className="mt-2 text-sm font-semibold text-[#b42318]">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={busy || !password} className="btn btn-primary mt-5 w-full">
        {busy ? <LoaderCircle className="size-4.5 animate-spin" aria-hidden="true" /> : null}
        Sign in
      </button>
    </form>
  );
}
