"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { chatStore } from "@/lib/client/chat-store";

export function OpenChatButton({ prompt, className, children }: { prompt?: string; className?: string; children: ReactNode }) {
  return (
    <button type="button" className={clsx(className)} onClick={() => chatStore.open(prompt)}>
      {children}
    </button>
  );
}
