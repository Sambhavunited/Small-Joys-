import type { ReactNode } from "react";
import clsx from "clsx";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={clsx("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="mt-2 font-display text-[2.35rem] leading-[1.02] text-ink sm:text-5xl">{title}</h2>
        {intro ? <p className="mt-3 text-[1.02rem] leading-relaxed text-muted">{intro}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
