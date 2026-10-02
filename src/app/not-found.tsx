import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OpenChatButton } from "@/components/open-chat-button";

export default function NotFound() {
  return (
    <div className="container-page flex flex-1 flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">Page not found</p>
      <h1 className="mt-3 font-display text-6xl leading-none sm:text-7xl">
        This treat <span className="text-burgundy italic">isn&apos;t here</span>
      </h1>
      <p className="mt-4 max-w-md text-lg text-muted">
        The page may have moved. The menu is still full of good things, and Joy is happy to help.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/menu" className="btn btn-primary px-6">
          Browse the menu <ArrowRight className="size-4.5" aria-hidden="true" />
        </Link>
        <OpenChatButton className="btn btn-outline px-6">Ask Joy</OpenChatButton>
      </div>
    </div>
  );
}
