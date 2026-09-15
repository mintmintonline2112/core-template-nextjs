import type { ComponentType } from "react";
import type { SectionProps } from "./shared";

// Section của trang chuẩn — mỗi khối trên trang một tên.
import { AboutMap } from "./AboutMap";
import { AboutMapRegions } from "./AboutMapRegions";
import { AlmondVarieties } from "./AlmondVarieties";
import { BuyersMarquee } from "./BuyersMarquee";
import { ContactDetails } from "./ContactDetails";
import { Faq } from "./Faq";
import { HeroSlider } from "./HeroSlider";
import { HowItWorks } from "./HowItWorks";
import { KernelSizes } from "./KernelSizes";
import { NaturalAlmonds } from "./NaturalAlmonds";
import { ProcessedAlmonds } from "./ProcessedAlmonds";
import { ProductSpecs } from "./ProductSpecs";
import { QuoteChecklist } from "./QuoteChecklist";
import { RequestQuote } from "./RequestQuote";
import { SourcingServices } from "./SourcingServices";
import { WhyUs } from "./WhyUs";
import { WorkingProcess } from "./WorkingProcess";

// Thư viện component chung — giữ để tái sử dụng trên trang tự tạo.
import { Checklist } from "./Checklist";
import { ContactInfo } from "./ContactInfo";
import { DocGrid } from "./DocGrid";
import { HeroStats } from "./HeroStats";
import { IconCardList } from "./IconCardList";
import { MarketsMap } from "./MarketsMap";
import { Marquee } from "./Marquee";
import { NameCards } from "./NameCards";
import { ProductsOverview } from "./ProductsOverview";
import { QuoteCta } from "./QuoteCta";
import { SizeGrid } from "./SizeGrid";
import { SliderChain } from "./SliderChain";
import { Stats } from "./Stats";
import { WhyCards } from "./WhyCards";

/**
 * REGISTRY component.
 *
 * QUY TẮC TÊN: key (kebab-case) = tên file component (PascalCase) = sectionKey
 * trong CMS = key trong bảng section_definitions = id neo trên trang.
 * VD `product-specs` ↔ ProductSpecs.tsx ↔ /#product-specs.
 * Phần tương tác ("use client") nằm ở _components/ với hậu tố Client khi cần tách.
 *
 * Thêm component mới = 1 file trong thư mục này + 1 dòng ở đây
 * + 1 entry trong backend/src/database/seeding/seeds/section-definition.seed.ts.
 */
export const SECTION_COMPONENTS: Record<string, ComponentType<SectionProps>> = {
  // ── Home ──
  "hero-slider": HeroSlider,
  "about-map": AboutMap,
  "about-map-regions": AboutMapRegions, // phiên bản khác của about-map
  "almond-varieties": AlmondVarieties,
  "product-specs": ProductSpecs,
  "how-it-works": HowItWorks,
  "working-process": WorkingProcess,
  "sourcing-services": SourcingServices,
  "buyers-marquee": BuyersMarquee,
  "why-us": WhyUs,
  faq: Faq,
  "request-quote": RequestQuote,
  // ── Products ──
  "natural-almonds": NaturalAlmonds,
  "processed-almonds": ProcessedAlmonds,
  "kernel-sizes": KernelSizes,
  // ── Contact ──
  "contact-details": ContactDetails,
  "quote-checklist": QuoteChecklist,

  // ── Thư viện component chung ──
  "hero-stats": HeroStats, // hero tĩnh cũ của trang chủ — cất lại để dùng khi cần
  stats: Stats,
  "markets-map": MarketsMap,
  "products-overview": ProductsOverview,
  "icon-card-list": IconCardList,
  "slider-chain": SliderChain,
  "doc-grid": DocGrid,
  marquee: Marquee,
  "why-cards": WhyCards,
  "quote-cta": QuoteCta,
  "name-cards": NameCards,
  "size-grid": SizeGrid,
  checklist: Checklist,
  "contact-info": ContactInfo,
};

export {
  AboutMap,
  AboutMapRegions,
  AlmondVarieties,
  BuyersMarquee,
  ContactDetails,
  Faq,
  HeroSlider,
  HeroStats,
  HowItWorks,
  KernelSizes,
  NaturalAlmonds,
  ProcessedAlmonds,
  ProductSpecs,
  QuoteChecklist,
  RequestQuote,
  SourcingServices,
  WhyUs,
  WorkingProcess,
};
export { GenericBlock } from "./GenericBlock";
export type { SectionProps } from "./shared";
