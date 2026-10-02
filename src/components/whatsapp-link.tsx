import type { ReactNode } from "react";
import clsx from "clsx";
import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/whatsapp";

export function WhatsAppLink({ message, className, children }: { message: string; className?: string; children: ReactNode }) {
  return (
    <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer" className={clsx("btn btn-whatsapp", className)}>
      <MessageCircle className="size-4.5" aria-hidden="true" />
      {children}
    </a>
  );
}
