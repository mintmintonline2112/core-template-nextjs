import type { ComponentType } from "react";
import type { SectionProps } from "./shared";

import { AboutMap } from "./AboutMap";
import { Checklist } from "./Checklist";
import { Contact } from "./Contact";
import { Faq } from "./Faq";
import { FeatureCards } from "./FeatureCards";
import { FeatureList } from "./FeatureList";
import { Hero } from "./Hero";
import { IconCardList } from "./IconCardList";
import { Marquee } from "./Marquee";
import { MediaCards } from "./MediaCards";
import { MediaTabs } from "./MediaTabs";
import { NumberedList } from "./NumberedList";
import { PhotoSlider } from "./PhotoSlider";
import { PhotoStrip } from "./PhotoStrip";
import { QuoteForm } from "./QuoteForm";
import { SizeScale } from "./SizeScale";
import { SpecSheet } from "./SpecSheet";
import { Stats } from "./Stats";
import { Steps } from "./Steps";

/**
 * REGISTRY component — mỗi component là MỘT BỐ CỤC, đặt tên theo hình dạng.
 *
 * key (kebab-case) = tên file (PascalCase) = `metadata._component` của section
 * = key trong bảng section_definitions. Biến thể hiển thị là `metadata.layout`.
 * Section key của từng section là id neo trên trang (VD /#about-map), có thể
 * khác tên component (dùng một component nhiều lần trên một trang).
 *
 * Thêm component = 1 file ở đây + 1 dòng dưới + 1 entry trong
 * backend/src/database/seeding/seeds/section-definition.seed.ts
 * (+ hình minh hoạ trong admin component-picker.tsx).
 */
export const SECTION_COMPONENTS: Record<string, ComponentType<SectionProps>> = {
  hero: Hero,
  stats: Stats,
  "about-map": AboutMap,
  "media-cards": MediaCards,
  "media-tabs": MediaTabs,
  "size-scale": SizeScale,
  "photo-strip": PhotoStrip,
  "photo-slider": PhotoSlider,
  "icon-card-list": IconCardList,
  "spec-sheet": SpecSheet,
  steps: Steps,
  "feature-list": FeatureList,
  marquee: Marquee,
  "feature-cards": FeatureCards,
  faq: Faq,
  "quote-form": QuoteForm,
  checklist: Checklist,
  "numbered-list": NumberedList,
  contact: Contact,
};

/**
 * Tên component CŨ (trước khi gộp theo bố cục) → component + layout hiện tại.
 * Lưới an toàn cho dữ liệu chưa chạy migration; migration
 * `layout_components` ghi thẳng `_component` + `layout` mới vào từng section.
 */
export type LegacyEntry = {
  component: string;
  layout?: string;
  /** Key metadata cũ → key mới (chỉ áp dụng khi key mới còn thiếu). */
  keys?: Record<string, string>;
};

const LIST = (from: string): Record<string, string> => ({ [from]: "items" });

export const LEGACY_COMPONENTS: Record<string, LegacyEntry> = {
  "hero-slider": { component: "hero", layout: "slider" },
  "hero-stats": { component: "hero", layout: "static" },
  "markets-map": { component: "about-map", layout: "pins" },
  "about-map-regions": { component: "about-map", layout: "regions" },
  "almond-varieties": { component: "media-cards", layout: "circles", keys: LIST("varieties") },
  "variety-circles": { component: "media-cards", layout: "circles", keys: LIST("varieties") },
  "almond-variety-cards": { component: "media-cards", layout: "toggle", keys: LIST("cards") },
  "products-overview": { component: "media-cards", layout: "names", keys: LIST("varieties") },
  "name-cards": { component: "media-cards", layout: "names", keys: { varieties: "items", formats: "items" } },
  "natural-almonds": { component: "media-cards", layout: "photo", keys: LIST("varieties") },
  "processed-almonds": { component: "media-cards", layout: "badge", keys: LIST("formats") },
  "kernel-sizes": { component: "size-scale", layout: "section", keys: LIST("sizes") },
  "size-grid": { component: "size-scale", layout: "section", keys: LIST("sizes") },
  "sizes-band": { component: "size-scale", layout: "band", keys: LIST("sizes") },
  "photo-strip": { component: "photo-strip", keys: LIST("photos") },
  "product-specs": { component: "icon-card-list", layout: "split", keys: LIST("configurations") },
  "how-it-works": { component: "steps", layout: "slider", keys: LIST("chain") },
  "slider-chain": { component: "steps", layout: "slider", keys: LIST("chain") },
  "working-process": { component: "steps", layout: "circles", keys: LIST("steps") },
  "sourcing-services": { component: "feature-list", layout: "split", keys: { documents: "items", incoterms: "chips" } },
  "doc-grid": { component: "feature-list", layout: "grid", keys: { documents: "items", incoterms: "chips" } },
  "buyers-marquee": { component: "marquee", keys: LIST("audiences") },
  "why-us": { component: "feature-cards", keys: LIST("reasons") },
  "why-cards": { component: "feature-cards", keys: LIST("reasons") },
  "faq-split": { component: "faq", layout: "split" },
  "request-quote": { component: "quote-form", keys: LIST("checklist") },
  "quote-cta": { component: "quote-form", keys: LIST("checklist") },
  "quote-checklist": { component: "checklist", keys: LIST("checklist") },
  "contact-details": { component: "contact", layout: "form" },
  "contact-info": { component: "contact", layout: "list" },
};

/** Tên component (mới hoặc cũ) → component + layout / key gợi ý; không khớp → null. */
export function resolveComponent(key: string): LegacyEntry | null {
  if (SECTION_COMPONENTS[key]) return { component: key };
  return LEGACY_COMPONENTS[key] ?? null;
}

export {
  AboutMap,
  Checklist,
  Contact,
  Faq,
  FeatureCards,
  FeatureList,
  Hero,
  IconCardList,
  Marquee,
  MediaCards,
  MediaTabs,
  NumberedList,
  PhotoSlider,
  PhotoStrip,
  QuoteForm,
  SizeScale,
  SpecSheet,
  Stats,
  Steps,
};
export { GenericBlock } from "./GenericBlock";
export type { SectionProps } from "./shared";
