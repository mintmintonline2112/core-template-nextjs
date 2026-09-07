import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/**
 * Backend gọi endpoint này (fire-and-forget) mỗi khi admin sửa nội dung:
 * drop fetch-cache tag tương ứng ('menu' | 'pages' | 'blog-posts') để site
 * public cập nhật ngay thay vì đợi hết chu kỳ revalidate theo thời gian.
 */
const ALLOWED_TAGS = new Set(["menu", "pages", "blog-posts", "settings"]);

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ revalidated: false }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    tags?: unknown;
  } | null;
  const tags = Array.isArray(body?.tags)
    ? body.tags.filter(
        (tag): tag is string => typeof tag === "string" && ALLOWED_TAGS.has(tag),
      )
    : [];

  for (const tag of tags) revalidateTag(tag);

  return NextResponse.json({ revalidated: true, tags });
}
