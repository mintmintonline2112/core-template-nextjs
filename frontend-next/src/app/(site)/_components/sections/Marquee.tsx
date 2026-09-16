import { anchorId, inlineHtml, strings, type SectionProps } from "./shared";

function MarqueeLine({ items }: { items: string[] }) {
  return (
    <p className="serve-copy" aria-hidden="true">
      {items.map((item) => (
        <span key={item} style={{ display: "contents" }}>
          <span>{item}</span>
          <span className="serve-dot">✦</span>
        </span>
      ))}
    </p>
  );
}

/**
 * SECTION `marquee` — tiêu đề nhỏ (heading) + chữ chạy ngang. Đủ mục thì chia
 * 2 dòng chạy ngược chiều (trên → phải, dưới → trái); dưới cùng là câu ghi chú
 * (content). Không có mục nào thì không render.
 * CMS: heading, content, metadata.items [].
 */
export function Marquee({ section }: SectionProps) {
  const list = strings(section, "items");
  if (list.length === 0) return null;

  const half = Math.ceil(list.length / 2);
  const rowA = list.slice(0, half);
  const rowB = list.slice(half);

  return (
    <section className="serve-band" id={anchorId(section, "marquee")}>
      <div className="container reveal">
        {section?.heading ? <p className="eyebrow">{section.heading}</p> : null}
        <p className="sr-only">{list.join(", ")}</p>
        {/* Nhân 4 bản để vòng lặp liền mạch */}
        <div className="serve-marquee">
          <div className="serve-track serve-track-right">
            {[0, 1, 2, 3].map((copy) => (
              <MarqueeLine items={rowA} key={copy} />
            ))}
          </div>
        </div>
        {rowB.length > 0 ? (
          <div className="serve-marquee">
            <div className="serve-track serve-track-left">
              {[0, 1, 2, 3].map((copy) => (
                <MarqueeLine items={rowB} key={copy} />
              ))}
            </div>
          </div>
        ) : null}
        {section?.content?.trim() ? (
          <p className="serve-sub" dangerouslySetInnerHTML={{ __html: inlineHtml(section.content) }} />
        ) : null}
      </div>
    </section>
  );
}
