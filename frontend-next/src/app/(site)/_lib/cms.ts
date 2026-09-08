import { ApiError, apiFetch } from "@/lib/api";
import { env } from "@/lib/env";
import type { BlogCategory, BlogPost, CmsPage, Paginated } from "@/types/cms";

/** Fetch layer cho nội dung CMS public (site tiếng Anh, không cần ?lang). */

const CMS_REVALIDATE_SECONDS = 60;

function cmsRequestInit(tag: string) {
  return {
    next: {
      revalidate: CMS_REVALIDATE_SECONDS,
      tags: [tag],
    },
  };
}

export type BlogPostQuery = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
};

export async function getCmsPage(slug: string): Promise<CmsPage | null> {
  try {
    return await apiFetch<CmsPage | null>(
      `client/pages/${encodeURIComponent(slug)}`,
      cmsRequestInit("pages"),
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    return null;
  }
}

export async function getBlogPosts(
  query: BlogPostQuery = {},
): Promise<Paginated<BlogPost> | null> {
  const params = new URLSearchParams({
    page: String(query.page ?? 1),
    limit: String(query.limit ?? 12),
    orderBy: JSON.stringify([{ publishedAt: "DESC" }]),
  });
  if (query.search) params.set("search", query.search);
  if (query.categoryId) params.set("categoryId", String(query.categoryId));

  try {
    return await apiFetch<Paginated<BlogPost>>(
      `client/blog-posts?${params.toString()}`,
      cmsRequestInit("blog-posts"),
    );
  } catch {
    return null;
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    return await apiFetch<BlogPost | null>(
      `client/blog-posts/slug/${encodeURIComponent(slug)}`,
      cmsRequestInit("blog-posts"),
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    return null;
  }
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  try {
    return await apiFetch<BlogCategory[]>(
      "client/blog-categories",
      cmsRequestInit("blog-posts"),
    );
  } catch {
    return [];
  }
}

/** Chuyển đường dẫn media từ backend (/uploads/...) thành URL tuyệt đối. */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const base = env.publicApiUrl.replace(/\/api$/, "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Map sections theo sectionKey để component tra cứu nhanh. */
export function sectionMap(page: CmsPage | null) {
  const map = new Map<string, CmsPage["sections"][number]>();
  for (const section of page?.sections ?? []) {
    if (section.isActive !== false) map.set(section.sectionKey, section);
  }
  return map;
}
