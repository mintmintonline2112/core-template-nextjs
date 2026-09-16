import {
  Head,
  Shell,
  StatsList,
  anchorId,
  items,
  type SectionProps,
} from "./shared";

/**
 * SECTION `stats` — tiêu đề và dải số liệu nổi bật. CMS: metadata.stats [{label,value}].
 *
 * Dải số liệu dùng chung với hero (StatsList trong shared.tsx, đã chuyển sang
 * Tailwind); `band` = bản dành cho nền sáng, thay cho class `.stats-band` cũ.
 */
export function Stats({ section, index = 0 }: SectionProps) {
  return (
    <Shell tint={index % 2 === 1} id={anchorId(section, "stats")}>
      <Head section={section} />
      <StatsList stats={items(section, "stats")} band className="reveal" />
    </Shell>
  );
}
