import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nati-istat.vercel.app";
  const now = new Date();
  return [
    { url: base, lastModified: now, priority: 1 },
    { url: `${base}/metodologia`, lastModified: now, priority: 0.8 },
    { url: `${base}/dati`, lastModified: now, priority: 0.6 },
  ];
}
