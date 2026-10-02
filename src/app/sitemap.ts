import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/menu", priority: 0.9 },
    { path: "/gifting", priority: 0.9 },
    { path: "/custom-cakes", priority: 0.8 },
    { path: "/catering", priority: 0.7 },
    { path: "/about", priority: 0.6 },
    { path: "/contact", priority: 0.7 },
    { path: "/privacy", priority: 0.2 },
  ];
  return pages.map((p) => ({ url: `${site.url}${p.path}`, changeFrequency: "weekly", priority: p.priority }));
}
