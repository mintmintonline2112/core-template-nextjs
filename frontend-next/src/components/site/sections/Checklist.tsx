import { Head, Shell, meta, strings, type SectionProps } from "./shared";

/** Lưới checklist đơn giản — metadata.checklist []. */
export function Checklist({ section, index }: SectionProps) {
  const checklist = strings(meta(section), "checklist");
  return (
    <Shell tint={index % 2 === 1} id={section.sectionKey}>
      <Head section={section} />
      <ul className="doc-grid reveal">
        {checklist.map((item) => (
          <li key={item}>
            <span className="doc-check" aria-hidden="true">✓</span>
            {item}
          </li>
        ))}
      </ul>
    </Shell>
  );
}
