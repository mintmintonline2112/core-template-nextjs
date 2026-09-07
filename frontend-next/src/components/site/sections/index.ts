import type { ComponentType } from "react";
import type { SectionProps } from "./shared";
import { Checklist } from "./Checklist";
import { ContactInfo } from "./ContactInfo";
import { DocGrid } from "./DocGrid";
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
 * REGISTRY component: key = loại component trong bảng section_definitions.
 * Thêm component mới = 1 file trong thư mục này + 1 dòng ở đây
 * + 1 entry trong backend/src/database/seeding/seeds/section-definition.seed.ts.
 */
export const SECTION_COMPONENTS: Record<string, ComponentType<SectionProps>> = {
  hero: Stats,
  markets: MarketsMap,
  "products-overview": ProductsOverview,
  orders: IconCardList,
  sourcing: SliderChain,
  logistics: DocGrid,
  "who-we-serve": Marquee,
  "why-us": WhyCards,
  "quote-cta": QuoteCta,
  "natural-almonds": NameCards,
  "processed-almonds": NameCards,
  "kernel-sizes": SizeGrid,
  "contact-info": ContactInfo,
  "quotation-checklist": Checklist,
};

export { GenericBlock } from "./GenericBlock";
export type { SectionProps } from "./shared";
