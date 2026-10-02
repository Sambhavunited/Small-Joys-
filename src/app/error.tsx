"use client";

import { useEffect } from "react";
import Link from "next/link";
import { site } from "@/data/site";
import { whatsappUrl } from "@/lib/whatsapp";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex flex-1 flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">Sorry, that didn&apos;t load</h1>
      <p className="mt-4 max-w-md text-lg text-muted">
        Please try again. If it keeps happening, you can always order on WhatsApp at {site.phoneDisplay}.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={() => retry()} className="btn btn-primary px-6">
          Try again
        </button>
        <a href={whatsappUrl(`Hi ${site.name}!`)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp px-6">
          WhatsApp us
        </a>
        <Link href="/" className="btn btn-outline px-6">
          Home
        </Link>
      </div>
    </div>
  );
}
