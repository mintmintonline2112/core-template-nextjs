import { AboutMapRegionsClient, type RegionEntry } from "@/app/(site)/_components/AboutMapRegionsClient";
import { WorldMap } from "@/app/(site)/_components/WorldMap";
import { DEFAULT_MAP_REGIONS, countriesInRegion } from "@/config/markets";
import { Head, anchorId, layoutOf, metaOf, type SectionProps } from "./shared";

const LAYOUTS = ["pins", "regions"] as const;

type CmsRegion = { key?: string; name?: string; countries?: string[] };

/**
 * SECTION `about-map` — giới thiệu + bản đồ thế giới.
 * layout `pins`: bản đồ ghim thị trường với 6 nút khu vực dưới bản đồ.
 * layout `regions`: danh sách khu vực bên trái (bấm để xem các nước), bản đồ
 *   bên phải sáng đúng khu vực đang chọn.
 * CMS: heading, subheading, content, metadata.regions [{key,name,countries[]}]
 * (key thuộc us/na/ap/sa/me/eu; trống thì dùng 6 khu vực của bản đồ).
 */
export function AboutMap({ section }: SectionProps) {
  const layout = layoutOf(section, LAYOUTS, "pins");
  const cmsRegions = metaOf<CmsRegion[]>(section, "regions")?.filter((region) => region.key && region.name);

  if (layout === "regions") {
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
      <section className="section about-map-regions" id={anchorId(section, "about-map")}>
        <div className="container">
          <Head section={section} />
          <AboutMapRegionsClient regions={regions} />
        </div>
      </section>
    );
  }

  const pins = cmsRegions?.map((region) => ({ key: region.key!, label: region.name! }));
  return (
    <section className="section" id={anchorId(section, "about-map")}>
      <div className="container">
        <Head section={section} />
        <WorldMap regions={pins && pins.length > 0 ? pins : undefined} />
      </div>
    </section>
  );
}
