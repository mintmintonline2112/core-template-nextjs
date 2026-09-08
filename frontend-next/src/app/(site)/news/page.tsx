import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterForm } from "@/app/(site)/_components/forms";
import { getBlogCategories, getBlogPosts, getCmsPage, mediaUrl } from "@/app/(site)/_lib/cms";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import type { BlogPost } from "@/types/cms";
import { siteRoutes } from "@/config/routes";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage("news");
  return buildPageMetadata({
    title: page?.metaTitle ?? "News & Insights",
    description:
      page?.metaDescription ??
      "News, market updates, and industry insights from Prime Nuts USA.",
    path: siteRoutes.news,
    image: page?.ogImagePath,
    canonical: page?.canonicalUrl,
  });
}

const POSTS_PER_PAGE = 7;

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function readingTime(post: BlogPost): string {
  const words = post.content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function Thumb({ post, className }: { post: BlogPost; className: string }) {
  const src = mediaUrl(post.coverImagePath);
  if (!src) return null;
  return (
    <div className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={post.title} loading="lazy" />
    </div>
  );
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const pageNumber = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const categories = (await getBlogCategories()).filter(
    (category) => category.isActive !== false && !category.parentId,
  );
  const activeCategory = params.category
    ? categories.find((category) => category.slug === params.category)
    : undefined;

  const result = await getBlogPosts({
    page: pageNumber,
    limit: POSTS_PER_PAGE,
    categoryId: activeCategory?.id,
  });

  const posts = result?.data ?? [];
  const totalPages = result?.meta.totalPages ?? 1;
  const [featured, ...rest] =
    pageNumber === 1 && !activeCategory ? posts : [undefined, ...posts];
  const gridPosts = rest.filter(Boolean) as BlogPost[];

  const pageHref = (page: number) =>
    siteRoutes.newsFiltered({
      category: activeCategory?.slug,
      page: page > 1 ? page : undefined,
    });

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-inner">
          <p className="eyebrow eyebrow-gold reveal">News &amp; Insights</p>
          <h1 className="reveal">From the Orchard to the Market</h1>
          <p className="lead reveal">
            Crop updates, market perspectives, and company news for our buyers and distribution
            partners around the world.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {categories.length > 0 ? (
            <div className="region-chips reveal" style={{ marginTop: 0 }}>
              <Link href={siteRoutes.news} className={!activeCategory ? "active chip-link" : "chip-link"}>
                All
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={siteRoutes.newsCategory(category.slug)}
                  className={
                    activeCategory?.slug === category.slug ? "active chip-link" : "chip-link"
                  }
                >
                  {category.name}
                </Link>
              ))}
            </div>
          ) : null}

          {featured ? (
            <article className="news-featured reveal">
              <div className="news-featured-body">
                <div className="news-meta">
                  {featured.category ? (
                    <span className="news-tag">{featured.category.name}</span>
                  ) : null}
                  <span className="news-date">{formatDate(featured.publishedAt)}</span>
                </div>
                <h2>
                  <Link href={siteRoutes.newsPost(featured.slug)} className="news-title-link">
                    {featured.title}
                  </Link>
                </h2>
                <p>{featured.excerpt}</p>
                <p className="news-card-foot" style={{ borderColor: "rgba(217,180,95,0.3)", color: "var(--light-soft)" }}>
                  {readingTime(featured)} · Prime Nuts USA Editorial
                </p>
              </div>
              <div className="news-featured-art news-featured-photo">
                {mediaUrl(featured.coverImagePath) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(featured.coverImagePath)!} alt={featured.title} />
                ) : null}
              </div>
            </article>
          ) : null}

          {gridPosts.length > 0 ? (
            <div className="news-grid">
              {gridPosts.map((post) => (
                <article className="news-card reveal" key={post.id}>
                  <Link href={siteRoutes.newsPost(post.slug)} className="news-card-link">
                    <Thumb post={post} className="news-card-thumb" />
                    <div className="news-meta">
                      {post.category ? <span className="news-tag">{post.category.name}</span> : null}
                      <span className="news-date">{formatDate(post.publishedAt)}</span>
                    </div>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <p className="news-card-foot">{readingTime(post)}</p>
                  </Link>
                </article>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <p className="section-note reveal">
              {result
                ? "No articles published yet — check back soon."
                : "Could not load articles right now — please try again later."}
            </p>
          ) : null}

          {totalPages > 1 ? (
            <nav className="news-pagination reveal" aria-label="Pagination">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <Link
                  key={page}
                  href={pageHref(page)}
                  className={page === pageNumber ? "active" : undefined}
                  aria-current={page === pageNumber ? "page" : undefined}
                >
                  {page}
                </Link>
              ))}
            </nav>
          ) : null}

          <div className="newsletter reveal">
            <div>
              <h2>Stay in the Loop</h2>
              <p>
                Market updates and availability notes for commercial buyers — a short email, a
                few times per season.
              </p>
            </div>
            <div>
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container reveal">
          <p className="eyebrow eyebrow-gold">Work With Us</p>
          <h2>Looking for California Almond Supply?</h2>
          <p>Tell us your requirements and our team will prepare a commercial quotation.</p>
          <div className="cta-band-actions">
            <Link href={siteRoutes.contact} className="btn btn-gold">Request a B2B Quote</Link>
            <Link href={siteRoutes.products} className="btn btn-ghost">Browse Our Products</Link>
          </div>
        </div>
      </section>
    </>
  );
}
