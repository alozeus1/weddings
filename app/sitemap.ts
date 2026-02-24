import type { MetadataRoute } from "next";
import { allRoutes } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return allRoutes.map((route) => ({
    url: `${baseUrl}${route.href}`,
    lastModified: new Date()
  }));
}
