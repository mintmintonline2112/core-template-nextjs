import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CtaBand,
  SECTION_NOTE,
  SECTION_PHOTO,
} from "@/app/(site)/_components/ui";
import { getBlogPost, mediaUrl } from "@/app/(site)/_lib/cms";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import { getSiteSettings, POST_TITLE_DEFAULT } from "@/lib/settings";
import { siteRoutes } from "@/config/routes";
import { cn } from "@/utils/cn";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Không tìm thấy bài viết", robots: { index: false } };
  return buildPageMetadata({
    title: post.metaTitle?.trim() || post.title,
    description: post.metaDescription ?? post.excerpt,
    path: siteRoutes.newsPost(post.slug),
    image: post.ogImagePath ?? post.coverImagePath,
    canonical: post.canonicalUrl,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
  });
}

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Khung ảnh bìa bài viết: như PHOTO_FRAME (ui.tsx) nhưng KHÔNG có hiệu ứng rê
 * chuột (viền vàng, lớp tối, ảnh sáng lên) và bóng nhẹ hơn. Giữ móc `photo-frame`
 * để ảnh vẫn mở khẩu độ + trượt theo cuộn (SiteEffects.tsx).
 */
const COVER_FRAME =
  "photo-frame relative m-0 overflow-hidden rounded-lg border border-line bg-paper shadow-soft [&_img]:block [&_img]:h-full [&_img]:w-full [&_img]:object-cover";

/** Thời gian đọc ước lượng: bỏ thẻ HTML, 200 từ / phút, tối thiểu 1 phút. */
function readingMinutes(html: string): number {
  const words = html
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Trang bài viết — đầu bài KIỂU BÁO, nền sáng (khác dải ảnh nhoè của các trang):
 * chip danh mục · ngày đăng · thời gian đọc, tiêu đề lớn chữ navy, đoạn tóm tắt,
 * rồi ảnh bìa nét hiện MỘT lần, rộng hơn cột chữ.
 */
export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([
    getBlogPost(slug),
    getSiteSettings(),
  ]);
  if (!post) notFound();

  const cover = mediaUrl(post.coverImagePath);
  // Admin → Cài đặt → Cỡ chữ tiêu đề bài viết (mobile tự co bằng min với vw).
  const titleSize =
    settings.postTitleSize && settings.postTitleSize !== POST_TITLE_DEFAULT
      ? `min(${settings.postTitleSize}px, 8.5vw)`
      : undefined;

  return (
    <>
      <header className="border-b border-line-soft bg-[linear-gradient(180deg,var(--cream-2)_0%,var(--cream)_100%)] pt-[clamp(3rem,6vw,5rem)] pb-[clamp(2.5rem,5vw,3.5rem)]">
        <div className="site-container max-w-208 text-center">
          <div className="reveal mb-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs tracking-md text-ink-faint uppercase">
            {post.category ? (
              <Link
                href={siteRoutes.newsFiltered({
                  category: post.category.slug,
                })}
                className="rounded-full border border-gold-400 px-3 py-1 font-semibold text-gold-500 no-underline transition-colors duration-200 ease-brand hover:bg-gold-400 hover:text-navy-900"
              >
                {post.category.name}
              </Link>
            ) : null}
            {/* Ngày + thời gian đọc là một cụm: xuống dòng thì xuống cả cụm.
                Admin → Cài đặt → Hiện ngày đăng & số phút đọc (tắt = ẩn cả cụm). */}
            {settings.showPostMeta !== false ? (
              <span className="whitespace-nowrap">
                {post.publishedAt ? (
                  <>
                    <time dateTime={post.publishedAt}>
                      {formatDate(post.publishedAt)}
                    </time>
                    <span aria-hidden="true" className="mx-2">
                      ·
                    </span>
                  </>
                ) : null}
                {readingMinutes(post.content)} phút đọc
              </span>
            ) : null}
          </div>

          <h1
            data-headline
            className="reveal m-0 text-h1 text-balance text-navy-900"
            style={titleSize ? { fontSize: titleSize } : undefined}
          >
            {post.title}
          </h1>

          {post.excerpt ? (
            <p className="reveal mx-auto mt-6 mb-0 max-w-160 text-xl text-ink-soft">
              {post.excerpt}
            </p>
          ) : null}
          <p className="reveal mt-5 mb-0 text-sm text-ink-faint">
            Ban biên tập
          </p>
        </div>
      </header>

      <section className="pt-[clamp(2.5rem,5vw,3.5rem)] pb-(--section-pad)">
        {cover ? (
          <div className="site-container max-w-5xl">
            <figure
              className={cn(
                COVER_FRAME,
                SECTION_PHOTO,
                "reveal max-[640px]:aspect-video",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover} alt={post.title} fetchPriority="high" />
            </figure>
          </div>
        ) : null}

        <div className="site-container max-w-208">
          <article
            className="post-content reveal"
            // Nội dung đã qua sanitizeRichText (server-side) trước khi render.
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(post.content) }}
          />

          <p className={cn(SECTION_NOTE, "reveal")}>
            <Link href={siteRoutes.news}>← Quay lại Tin tức &amp; Góc nhìn</Link>
          </p>
        </div>
      </section>

      <CtaBand
        eyebrow="Hợp tác cùng chúng tôi"
        title="Đang tìm một nhà cung cấp đáng tin cậy?"
        text="Cho chúng tôi biết yêu cầu của bạn, đội ngũ sẽ chuẩn bị báo giá phù hợp."
      >
        <Link href={siteRoutes.contact} className="btn btn-gold">
          Nhận báo giá B2B
        </Link>
        <Link href={siteRoutes.news} className="btn btn-ghost">
          Xem thêm bài viết
        </Link>
      </CtaBand>
    </>
  );
}
