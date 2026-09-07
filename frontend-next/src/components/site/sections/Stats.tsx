import { Head, Shell, items, meta, type SectionProps } from "./shared";

/** Dải số liệu nổi bật — metadata.stats [{label,value}], giá trị có số ở đầu tự chạy đếm. */
export function Stats({ section, index }: SectionProps) {
  const stats = items(meta(section), "stats").filter((s) => s.label && s.value);
  return (
    <Shell tint={index % 2 === 1} id={section.sectionKey}>
      <Head section={section} />
      {stats.length > 0 ? (
        <dl className="hero-stats stats-band reveal">
          {stats.map((stat) => (
            <div className="stat" key={stat.label}>
              <dt>{stat.label}</dt>
              <dd data-count={/^\d/.test(stat.value) ? Number.parseInt(stat.value, 10) : undefined}>
                {stat.value.split(/([′+])/).filter(Boolean).map((part, i) =>
                  part === "′" || part === "+" ? (
                    <span className="stat-suffix" key={i}>{part}</span>
                  ) : (
                    part
                  ),
                )}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </Shell>
  );
}
