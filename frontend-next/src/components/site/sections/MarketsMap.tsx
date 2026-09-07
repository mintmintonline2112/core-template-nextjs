import { WorldMap, type MapRegion } from "@/components/site/WorldMap";
import { Head, Shell, items, meta, type SectionProps } from "./shared";

/** Bản đồ thị trường tương tác — metadata.regions [{key,name}] (key: us/na/ap/sa/me/eu). */
export function MarketsMap({ section, index }: SectionProps) {
  const regions: MapRegion[] = items(meta(section), "regions")
    .filter((r) => r.key && r.name)
    .map((r) => ({ key: r.key, label: r.name }));
  return (
    <Shell tint={index % 2 === 1} id={section.sectionKey}>
      <Head section={section} />
      <WorldMap regions={regions.length > 0 ? regions : undefined} />
    </Shell>
  );
}
