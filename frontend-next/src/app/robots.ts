import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { ADMIN_BASE } from "@/config/routes";

/** Sinh /robots.txt: cho crawl site public, chặn admin + API nội bộ, trỏ tới sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: [`${ADMIN_BASE}/`, "/api/"] }],
    sitemap: `${env.siteUrl}/sitemap.xml`,
  };
}
