"use client";

import type { ReactNode } from "react";
import { m, stagger as staggerDelay, type Variants } from "motion/react";

/** Soft "ease out" used across the site: quick start, gentle landing. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const VIEWPORT = { once: true, amount: 0.15, margin: "0px 0px -6% 0px" } as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds to wait after the block scrolls into view */
  delay?: number;
  /** How far (px) the block rises as it fades in */
  y?: number;
};

/**
 * Fades and lifts its content in the first time it scrolls into view.
 * `data-reveal` lets the no-JavaScript fallback in the layout show it straight away.
 */
export function Reveal({ children, className, delay = 0, y = 18 }: RevealProps) {
  return (
    <m.div
      data-reveal=""
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.7, ease: EASE_OUT, delay }}
    >
      {children}
    </m.div>
  );
}

const group: Variants = {
  hidden: {},
  show: (stagger: number) => ({ transition: { delayChildren: staggerDelay(stagger, { startDelay: 0.05 }) } }),
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

/** Reveals its `StaggerItem` children one after another as the group scrolls into view. */
export function Stagger({
  children,
  className,
  stagger = 0.08,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  as?: "div" | "ul" | "ol";
}) {
  const Tag = as === "ul" ? m.ul : as === "ol" ? m.ol : m.div;
  return (
    <Tag className={className} variants={group} custom={stagger} initial="hidden" whileInView="show" viewport={VIEWPORT}>
      {children}
    </Tag>
  );
}

/** One child of `Stagger`. */
export function StaggerItem({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" }) {
  const Tag = as === "li" ? m.li : m.div;
  return (
    <Tag data-reveal="" className={className} variants={item}>
      {children}
    </Tag>
  );
}
