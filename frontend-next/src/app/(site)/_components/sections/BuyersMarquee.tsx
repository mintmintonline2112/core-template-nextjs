import { metaOf, type StandardSectionProps } from "./section-content";

const BUYERS = [
  "Importers", "Distributors", "Wholesalers", "Food Manufacturers",
  "Nut Processors & Roasters", "Retail & Private-Label Operators", "Food-Service Suppliers",
];

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
 * SECTION `buyers-marquee` — trang Home.
 * Tiêu đề nhỏ + 2 dòng chữ chạy ngang ngược chiều liệt kê nhóm khách hàng.
 * CMS: heading (tiêu đề nhỏ), metadata.audiences [].
 */
export function BuyersMarquee({ section }: StandardSectionProps) {
  const buyers = (metaOf<string[]>(section, "audiences") ?? BUYERS).filter(Boolean);
  // Chia 2 dòng chạy ngược chiều (trên → phải, dưới → trái).
  const half = Math.ceil(buyers.length / 2);
  const rowA = buyers.slice(0, half);
  const rowB = buyers.slice(half);

  return (
    <section className="serve-band" id={section?.sectionKey ?? "buyers-marquee"}>
      <div className="container reveal">
        <p className="eyebrow">{section?.heading ?? "International Buyers"}</p>
        <p className="sr-only">{buyers.join(", ")}</p>
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
        <p className="serve-sub">
          We welcome inquiries for recurring supply programs as well as spot purchases based on
          current California market availability.
        </p>
      </div>
    </section>
  );
}
