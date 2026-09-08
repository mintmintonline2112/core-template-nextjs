#user-client
import { CARD_ICONS, Head, IconBadge, Shell, items, meta, type SectionProps } from "./shared";

/** Danh sách thẻ có icon — metadata.configurations [{title,text}] (icon xoay vòng theo thiết kế). */
export function IconCardList({ section, index }: SectionProps) {
  const configs = items(meta(section), "configurations").filter((c) => c.title || c.label);
  return (
    <Shell tint={index % 2 === 1} id={section.sectionKey}>
      <Head section={section} />
      <ul className="config-list reveal">
        {configs.map((config, i) => (
          <li key={config.title ?? config.label}>
            <IconBadge>{CARD_ICONS[i % CARD_ICONS.length]}</IconBadge>
            <div>
              <h4>{config.title ?? config.label}</h4>
              {config.text ? <p>{config.text}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
