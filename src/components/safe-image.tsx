"use client";

import Image, { type ImageProps } from "next/image";
import { useState, type ReactNode } from "react";

/**
 * next/image that swaps to `fallback` (or nothing) if the photo can't load,
 * so a missing online photo never shows as a broken image.
 */
export function SafeImage({ fallback = null, alt, ...props }: ImageProps & { fallback?: ReactNode }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return <Image alt={alt} {...props} onError={() => setFailed(true)} />;
}
