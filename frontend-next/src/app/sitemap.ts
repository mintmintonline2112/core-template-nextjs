import type { MetadataRoute } from "next";
import { getBlogCategories, getBlogPosts } from "@/app/(site)/_lib/cms";
import { absoluteUrl } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";

/** Sinh /sitemap.xml: trang tĩnh + danh mục tin + toàn bộ bài viết đã đăng. Cache 1 giờ. */
export const revalidate = 3600;

const POSTS_PER_REQUEST = 100;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: absoluteUrl(siteRoutes.home), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl(siteRoutes.products), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl(siteRoutes.news), lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl(siteRoutes.contact), lastModified: now, changeFrequency: "yearly", priority: 0.6 },
  ];

  // API tắt lúc build → sitemap vẫn phải sinh được (chỉ gồm trang tĩnh).
  let categories: Awaited<ReturnType<typeof getBlogCategories>> = [];
  let posts: Awaited<ReturnType<typeof fetchAllPosts>> = [];
  try {
    [categories, posts] = await Promise.all([getBlogCategories(), fetchAllPosts()]);
  } catch {
    categories = [];
    posts = [];
  }

  const categoryEntries: MetadataRoute.Sitemap = categories
    .filter((c) => c.isActive !== false)
    .map((c) => ({
      url: absoluteUrl(siteRoutes.newsCategory(c.slug)),
      lastModified: safeDate(c.updatedAt, now),
      changeFrequency: "weekly",
      priority: 0.5,
    }));

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: absoluteUrl(siteRoutes.newsPost(p.slug)),
    lastModified: safeDate(p.updatedAt ?? p.publishedAt, now),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...categoryEntries, ...postEntries];
}

/** Ngày hợp lệ hoặc fallback — tránh RangeError "Invalid time value" khi data thiếu/hỏng. */
function safeDate(value: string | null | undefined, fallback: Date): Date {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

/** Gom hết bài viết qua các trang phân trang của API client. */
async function fetchAllPosts() {
  const first = await getBlogPosts({ page: 1, limit: POSTS_PER_REQUEST });
  if (!first) return [];
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, first.meta.totalPages - 1) }, (_, i) =>
      getBlogPosts({ page: i + 2, limit: POSTS_PER_REQUEST }),
    ),
  );
  return [first, ...rest].flatMap((r) => r?.data ?? []);
}
