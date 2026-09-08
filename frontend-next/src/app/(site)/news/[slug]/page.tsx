import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, mediaUrl } from "@/app/(site)/_lib/cms";
import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import { getSiteSettings, POST_TITLE_DEFAULT } from "@/lib/settings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.excerpt ?? undefined,
  };
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
  const [post, settings] = await Promise.all([getBlogPost(slug), getSiteSettings()]);
  if (!post) notFound();

  const cover = mediaUrl(post.coverImagePath);
  // Admin → Cài đặt → Cỡ chữ tiêu đề bài viết (mobile tự co bằng min với vw).
  const titleSize =
    settings.postTitleSize && settings.postTitleSize !== POST_TITLE_DEFAULT
      ? `min(${settings.postTitleSize}px, 8.5vw)`
      : undefined;

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-inner">
          <p className="eyebrow eyebrow-gold reveal">
            {post.category?.name ?? "News & Insights"}
          </p>
          <h1 className="reveal" style={titleSize ? { fontSize: titleSize } : undefined}>
            {post.title}
          </h1>
          <p className="lead reveal">
            {formatDate(post.publishedAt)} · Prime Nuts USA Editorial
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container post-layout">
          {cover ? (
            <figure className="photo-frame section-photo reveal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover} alt={post.title} />
            </figure>
          ) : null}

          <article
            className="post-content reveal"
            // Nội dung đã qua sanitizeRichText (server-side) trước khi render.
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(post.content) }}
          />

          <p className="section-note reveal">
            <Link href="/news">← Back to News &amp; Insights</Link>
          </p>
        </div>
      </section>

      <section className="cta-band">
        <div className="container reveal">
          <p className="eyebrow eyebrow-gold">Work With Us</p>
          <h2>Looking for California Almond Supply?</h2>
          <p>Tell us your requirements and our team will prepare a commercial quotation.</p>
          <div className="cta-band-actions">
            <Link href="/contact" className="btn btn-gold">Request a B2B Quote</Link>
            <Link href="/news" className="btn btn-ghost">More Articles</Link>
          </div>
        </div>
      </section>
    </>
  );
}
