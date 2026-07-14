import type { MetadataRoute } from "next";
import { LABS } from "@/components/labs/labs-meta";
import { ARTICLES } from "@/lib/articles";
import { SPORTS } from "@/lib/sports-energy";
import { GAMES } from "@/components/labs/games/core";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://healthblueprint.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${SITE_URL}${path}`;

  return [
    { url: url("/"), priority: 1 },
    { url: url("/learn"), priority: 0.9 },
    { url: url("/about"), priority: 0.6 },
    { url: url("/project"), priority: 0.6 },
    { url: url("/links"), priority: 0.5 },
    ...LABS.map((lab) => ({ url: url(`/labs/${lab.id}`), priority: 0.9 })),
    ...ARTICLES.map((a) => ({ url: url(`/learn/${a.slug}`), priority: 0.8 })),
    ...GAMES.map((g) => ({ url: url(g.route), priority: 0.5 })),
    ...SPORTS.map((s) => ({ url: url(`/labs/energy/sports/${s.id}`), priority: 0.5 })),
  ];
}
