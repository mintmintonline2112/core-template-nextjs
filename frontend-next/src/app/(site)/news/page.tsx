import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterForm } from "@/app/(site)/_components/forms";
import {
  CtaBand,
  PageHero,
  SECTION,
  SECTION_NOTE,
} from "@/app/(site)/_components/ui";
import { cn } from "@/utils/cn";
import {
  getBlogCategories,
  getBlogPosts,
  getCmsPage,
  heroImageUrl,
  mediaUrl,
} from "@/app/(site)/_lib/cms";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { getSiteSettings } from "@/lib/settings";
import type { BlogPost } from "@/types/cms";
import { siteRoutes } from "@/config/routes";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage("news");
  return buildPageMetadata({
    title: page?.metaTitle?.trim() || page?.title || "News & Insights",
    description:
      page?.metaDescription ??
      "News, market updates, and industry insights from Your Company.",
    path: siteRoutes.news,
    image: page?.ogImagePath,
    canonical: page?.canonicalUrl,
  });
}

const POSTS_PER_PAGE = 7;

/** Chip lọc danh mục; `active` = danh mục đang xem. */
const chip = (active: boolean) =>
  cn(
    "inline-block rounded-full border px-5 py-2 font-main text-base font-medium tracking-xs [transition:background-color_200ms_var(--ease),color_200ms_var(--ease),border-color_200ms_var(--ease),transform_200ms_var(--ease)] hover:border-navy-700 hover:bg-navy-700 hover:text-cream hover:[transform:translateY(-2px)]",
    active
      ? "border-navy-700 bg-navy-700 text-cream [transform:translateY(-2px)]"
      : "border-line bg-paper text-ink-soft",
  );

/** Dòng danh mục + ngày đăng. */
const META =
  "mb-4 flex flex-wrap items-center gap-3 text-xs tracking-md uppercase";
const TAG = "rounded-full border border-gold-400 px-3 py-1 font-semibold";

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function readingTime(post: BlogPost): string {
  const words = post.content
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

/**
 * Ảnh bìa trên đầu thẻ (tràn ra mép thẻ bằng margin âm). `news-card-thumb` là
 * móc cho hiệu ứng mở khẩu độ GSAP (SiteEffects.tsx).
 */
function Thumb({ post }: { post: BlogPost }) {
  const src = mediaUrl(post.coverImagePath);
  if (!src) return null;
  return (
    <div className="news-card-thumb -mx-7 -mt-7 mb-6 aspect-video overflow-hidden border-b border-b-line">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="block h-full w-full object-cover [transition:transform_400ms_var(--ease)] group-hover:[transform:scale(1.04)] motion-reduce:transition-none"
        src={src}
        alt={post.title}
        loading="lazy"
      />
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

  // Ảnh nền đầu trang lấy từ trang CMS "news" (Admin → Trang); chữ của dải giữ cố định.
  const [cmsPage, settings] = await Promise.all([
    getCmsPage("news"),
    getSiteSettings(),
  ]);
  // Admin → Cài đặt → Hiện ngày đăng & số phút đọc (mặc định bật).
  const showMeta = settings.showPostMeta !== false;
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
      <PageHero
        eyebrow="News & Insights"
        title="From the Orchard to the Market"
        lead="Crop updates, market perspectives, and company news for our buyers and distribution partners around the world."
        image={heroImageUrl(cmsPage?.heroImagePath)}
        imagePosition={cmsPage?.heroImagePosition}
      />

      <section className={SECTION}>
        <div className="site-container">
          {categories.length > 0 ? (
            <div className="reveal mt-0 mb-4 flex flex-wrap justify-center gap-2">
              <Link href={siteRoutes.news} className={chip(!activeCategory)}>
                All
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={siteRoutes.newsCategory(category.slug)}
                  className={chip(activeCategory?.slug === category.slug)}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          ) : null}

          {featured ? (
            <article className="reveal mb-[clamp(2.5rem,5vw,3.5rem)] grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-stretch overflow-hidden rounded-lg border border-navy-700 bg-[linear-gradient(170deg,var(--navy-700)_0%,var(--navy-800)_100%)] text-light shadow-lift max-[900px]:grid-cols-1">
              <div className="p-[clamp(2rem,4vw,3rem)]">
                <div className={META}>
                  {featured.category ? (
                    <span className={cn(TAG, "bg-gold-400 text-navy-900")}>
                      {featured.category.name}
                    </span>
                  ) : null}
                  {showMeta ? (
                    <span className="text-light-soft">
                      {formatDate(featured.publishedAt)}
                    </span>
                  ) : null}
                </div>
                <h2 className="text-h3 text-light">
                  <Link
                    href={siteRoutes.newsPost(featured.slug)}
                    className="text-inherit hover:text-gold-300"
                  >
                    {featured.title}
                  </Link>
                </h2>
                <p className="text-light-soft">{featured.excerpt}</p>
                <p className="mt-5 border-t border-t-gold-300/30 pt-4 text-sm text-light-soft italic">
                  {showMeta ? `${readingTime(featured)} · ` : ""}Your Company
                  Editorial
                </p>
              </div>
              {/* `news-featured-photo`: móc GSAP (mở khẩu độ + trượt dọc theo cuộn). */}
              <div className="news-featured-photo relative flex items-center justify-center border-l border-l-gold-300/30 bg-[radial-gradient(120%_100%_at_50%_100%,color-mix(in_oklab,var(--gold-300)_14%,transparent)_0%,transparent_60%)] p-0 max-[900px]:border-t max-[900px]:border-l-0 max-[900px]:border-t-gold-300/30">
                {mediaUrl(featured.coverImagePath) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="block h-full min-h-[280px] w-full object-cover"
                    src={mediaUrl(featured.coverImagePath)!}
                    alt={featured.title}
                  />
                ) : null}
              </div>
            </article>
          ) : null}

          {gridPosts.length > 0 ? (
            <div
              data-stagger="90"
              className="grid grid-cols-3 gap-6 max-[1080px]:grid-cols-2 max-[640px]:grid-cols-1"
            >
              {gridPosts.map((post) => (
                <article
                  className="tilt-card group reveal flex flex-col overflow-hidden rounded-lg border border-line bg-paper px-7 pt-7 pb-6"
                  key={post.id}
                >
                  <Link
                    href={siteRoutes.newsPost(post.slug)}
                    className="flex grow flex-col text-inherit"
                  >
                    <Thumb post={post} />
                    <div className={META}>
                      {post.category ? (
                        <span className={cn(TAG, "text-gold-500")}>
                          {post.category.name}
                        </span>
                      ) : null}
                      {showMeta ? (
                        <span className="text-ink-faint">
                          {formatDate(post.publishedAt)}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mb-2 text-2xl transition-[color] duration-200 ease-brand group-hover:text-navy-700">
                      {post.title}
                    </h3>
                    <p className="m-0 grow text-base text-ink-soft">
                      {post.excerpt}
                    </p>
                    {showMeta ? (
                      <p className="m-0 grow border-t border-t-line-soft pt-4 text-base text-ink-soft italic">
                        {readingTime(post)}
                      </p>
                    ) : null}
                  </Link>
                </article>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <p className={cn(SECTION_NOTE, "reveal")}>
              {result
                ? "No articles published yet — check back soon."
                : "Could not load articles right now — please try again later."}
            </p>
          ) : null}

          {totalPages > 1 ? (
            <nav
              className="reveal mt-[clamp(2rem,4vw,3rem)] flex justify-center gap-2"
              aria-label="Pagination"
            >
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <Link
                    key={page}
                    href={pageHref(page)}
                    className={cn(
                      "inline-flex h-[42px] min-w-[42px] items-center justify-center rounded border px-3 font-medium [transition:background-color_200ms_var(--ease),color_200ms_var(--ease),border-color_200ms_var(--ease)] hover:border-navy-700 hover:bg-navy-700 hover:text-cream",
                      page === pageNumber
                        ? "border-navy-700 bg-navy-700 text-cream"
                        : "border-line bg-paper text-ink-soft",
                    )}
                    aria-current={page === pageNumber ? "page" : undefined}
                  >
                    {page}
                  </Link>
                ),
              )}
            </nav>
          ) : null}

          <div className="reveal mt-[clamp(3rem,6vw,4.5rem)] grid grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center gap-8 rounded-lg border border-line bg-paper p-[clamp(2rem,4vw,3rem)] shadow-soft max-[900px]:grid-cols-1">
            <div>
              <h2 className="mb-1 text-3xl">Stay in the Loop</h2>
              <p className="m-0 text-ink-soft">
                Market updates and availability notes for commercial buyers — a
                short email, a few times per season.
              </p>
            </div>
            <div>
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="Work With Us"
        title="Looking for a Reliable Supplier?"
        text="Tell us your requirements and our team will prepare a commercial quotation."
      >
        <Link href={siteRoutes.contact} className="btn btn-gold">
          Request a B2B Quote
        </Link>
        <Link href={siteRoutes.products} className="btn btn-ghost">
          Browse Our Products
        </Link>
      </CtaBand>
    </>
  );
}
