import {
  AboutMapRegionsClient,
  type RegionEntry,
} from "@/app/(site)/_components/AboutMapRegionsClient";
import { DEFAULT_MAP_REGIONS, countriesInRegion } from "@/config/markets";
import { RichIntro, metaOf, type StandardSectionProps } from "./section-content";

const DEFAULT_INTRO =
  "<p>Prime Nuts USA is a California-based sourcing and trading company focused on connecting qualified international buyers with the California almond supply chain.</p>" +
  "<p>We simplify procurement by providing buyers with a local sourcing partner who understands supplier communication, product specifications, commercial requirements, logistics, and international trade.</p>";

/**
 * SECTION `about-map-regions` — trang Home (phiên bản khác của about-map).
 * Tiêu đề + giới thiệu ở trên; dưới là danh sách khu vực (trái) và bản đồ
 * sáng theo khu vực đang chọn (phải).
 * CMS: heading, subheading, content, metadata.regions [{key,name,countries[]}]
 * (key thuộc us/na/ap/sa/me/eu; countries để trống thì lấy theo ghim trên bản đồ).
 * Bản cũ vẫn giữ ở AboutMap.tsx (key about-map).
 */
export function AboutMapRegions({ section }: StandardSectionProps) {
  const cmsRegions = metaOf<Array<{ key?: string; name?: string; countries?: string[] }>>(section, "regions")
    ?.filter((region) => region.key && region.name);

  const regions: RegionEntry[] =
    cmsRegions && cmsRegions.length > 0
      ? cmsRegions.map((region) => ({
          key: region.key!,
          label: region.name!,
          countries:
            region.countries && region.countries.length > 0
              ? region.countries.filter(Boolean)
              : countriesInRegion(region.key!),
        }))
      : DEFAULT_MAP_REGIONS.map((region) => ({
          key: region.key,
          label: region.label,
          countries: countriesInRegion(region.key),
        }));

  return (
    <section className="section about-map-regions" id={section?.sectionKey ?? "about-map-regions"}>
      <div className="container">
        <div className="section-head reveal">
          <p className="eyebrow">{section?.subheading ?? "About Prime Nuts USA"}</p>
          <h2>{section?.heading ?? "Connecting California Supply with Global Demand"}</h2>
          <RichIntro html={section?.content ?? DEFAULT_INTRO} />
        </div>

        <AboutMapRegionsClient regions={regions} />
      </div>
    </section>
  );
}
