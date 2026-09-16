import { Head, Shell, StatsList, anchorId, items, type SectionProps } from "./shared";

/** SECTION `stats` — tiêu đề và dải số liệu nổi bật. CMS: metadata.stats [{label,value}]. */
export function Stats({ section, index = 0 }: SectionProps) {
  return (
    <Shell tint={index % 2 === 1} id={anchorId(section, "stats")}>
      <Head section={section} />
      <StatsList stats={items(section, "stats")} className="hero-stats stats-band reveal" />
    </Shell>
  );
}
