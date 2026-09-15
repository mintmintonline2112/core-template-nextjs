import type { Metadata } from "next";
import { PageSections } from "@/app/(site)/_components/SectionRenderer";
import {
  AboutMap,
  AlmondVarieties,
  BuyersMarquee,
  Faq,
  HeroSlider,
  HowItWorks,
  ProductSpecs,
  RequestQuote,
  SourcingServices,
  WorkingProcess,
} from "@/app/(site)/_components/sections";
import { getCmsPage } from "@/app/(site)/_lib/cms";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage("home");
  return buildPageMetadata({
    title: page?.metaTitle ?? "Prime Nuts USA — California Almonds. Sourced with Confidence.",
    absoluteTitle: true,
    description:
      page?.metaDescription ??
      "Reliable California almond sourcing, procurement, and export coordination for wholesale buyers worldwide.",
    path: siteRoutes.home,
    image: page?.ogImagePath,
    canonical: page?.canonicalUrl,
  });
}

/** Bộ khối mặc định — chỉ dùng khi API lỗi hoặc CMS chưa có trang "home". */
const DEFAULT_SECTIONS = [
  HeroSlider,
  AboutMap,
  AlmondVarieties,
  ProductSpecs,
  HowItWorks,
  WorkingProcess,
  SourcingServices,
  BuyersMarquee,
  Faq,
  RequestQuote,
];

/**
 * Trang chủ — hiển thị đúng các section của trang "home" trong CMS (Admin → Page
 * Sections): section đang bật, theo thứ tự admin. Xoá / tắt section = khối biến mất.
 * Mỗi section key = 1 component cùng tên trong _components/sections.
 */
export default async function HomePage() {
  const page = await getCmsPage("home");
  return <PageSections page={page} defaults={DEFAULT_SECTIONS} />;
}
