import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ARCH,
  CtaBand,
  PageHero,
  PHOTO_FRAME,
  SECTION,
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
  if (!post) return { title: "Article not found", robots: { index: false } };
  return buildPageMetadata({
    title: post.metaTitle ?? post.title,
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
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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
      <PageHero
        eyebrow={post.category?.name ?? "News & Insights"}
        title={post.title}
        titleStyle={titleSize ? { fontSize: titleSize } : undefined}
        lead={`${formatDate(post.publishedAt)} · Prime Nuts USA Editorial`}
      />

      <section className={SECTION}>
        <div className="site-container max-w-[52rem]">
          {cover ? (
            <figure className={cn(PHOTO_FRAME, SECTION_PHOTO, ARCH, "reveal")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover} alt={post.title} />
            </figure>
          ) : null}

          <article
            className="post-content reveal"
            // Nội dung đã qua sanitizeRichText (server-side) trước khi render.
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(post.content) }}
          />

          <p className={cn(SECTION_NOTE, "reveal")}>
            <Link href={siteRoutes.news}>← Back to News &amp; Insights</Link>
          </p>
        </div>
      </section>

      <CtaBand
        eyebrow="Work With Us"
        title="Looking for California Almond Supply?"
        text="Tell us your requirements and our team will prepare a commercial quotation."
      >
        <Link href={siteRoutes.contact} className="btn btn-gold">
          Request a B2B Quote
        </Link>
        <Link href={siteRoutes.news} className="btn btn-ghost">
          More Articles
        </Link>
      </CtaBand>
    </>
  );
}
