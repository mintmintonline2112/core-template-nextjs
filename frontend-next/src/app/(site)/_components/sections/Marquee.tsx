import { cn } from "@/utils/cn";
import { anchorId, inlineHtml, strings, type SectionProps } from "./shared";

/** Che mờ hai mép dải chữ chạy để chữ hiện/khuất dần thay vì cắt cụt. */
const EDGE_FADE =
  "[-webkit-mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)] [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]";

function MarqueeLine({ items }: { items: string[] }) {
  return (
    <p
      className="m-0 flex items-baseline gap-[1.4rem] text-[clamp(1.35rem,2.6vw,1.9rem)] font-medium whitespace-nowrap text-navy-700 italic"
      aria-hidden="true"
    >
      {items.map((item) => (
        <span className="contents" key={item}>
          <span>{item}</span>
          <span className="text-[0.55em] text-gold-400 not-italic">✦</span>
        </span>
      ))}
    </p>
  );
}

/**
 * Một dải chạy vô hạn: nhân 4 bản nội dung để vòng lặp liền mạch, rê chuột vào
 * thì dừng (`group` + group-hover). `tight` = dải thứ hai, ngồi sát dải trên.
 */
function MarqueeRow({
  items,
  direction,
  tight,
}: {
  items: string[];
  direction: "left" | "right";
  tight?: boolean;
}) {
  return (
    <div
      className={cn(
        "group mx-auto mt-[0.6rem] mb-[1.4rem] overflow-hidden",
        EDGE_FADE,
        tight && "mt-[0.2rem]",
      )}
    >
      <div
        className={cn(
          "flex w-max gap-[1.4rem] group-hover:[animation-play-state:paused]",
          direction === "right"
            ? "animate-[marquee-right_32s_linear_infinite]"
            : "animate-[marquee-left_26s_linear_infinite]",
        )}
      >
        {[0, 1, 2, 3].map((copy) => (
          <MarqueeLine items={items} key={copy} />
        ))}
      </div>
    </div>
  );
}

/**
 * SECTION `marquee` — tiêu đề nhỏ (heading) + chữ chạy ngang. Đủ mục thì chia
 * 2 dòng chạy ngược chiều (trên → phải, dưới → trái); dưới cùng là câu ghi chú
 * (content). Không có mục nào thì không render.
 * CMS: heading, content, metadata.items [].
 *
 * Đã chuyển sang Tailwind — khối `.serve-*` (trừ 2 dòng nói dưới đây) đã xoá
 * khỏi site.css. Ba thứ CÒN ở site.css và vì sao:
 * - `@keyframes marquee-left/right`: Tailwind chỉ gọi tên animation, keyframes
 *   vẫn phải khai ở CSS (dùng chung một chỗ, không nhân bản).
 * - `.serve-band`: GIỮ tên class dù không còn style riêng — site.css ẩn eyebrow
 *   ở mọi khối khác, chỉ chừa `.serve-band .eyebrow` (ở đây eyebrow chính là
 *   tiêu đề dải) và cho nó `display:inline-block` + gạch vàng căn giữa.
 * - `.eyebrow`, `.container`, `.sr-only`, `.reveal`: hạ tầng dùng chung, chưa chuyển.
 */
export function Marquee({ section }: SectionProps) {
  const list = strings(section, "items");
  if (list.length === 0) return null;

  const half = Math.ceil(list.length / 2);
  const rowA = list.slice(0, half);
  const rowB = list.slice(half);

  return (
    <section
      className="serve-band border-y border-line-soft bg-paper py-[clamp(3.5rem,7vw,5.5rem)] text-center"
      id={anchorId(section, "marquee")}
    >
      <div className="reveal container">
        {section?.heading ? <p className="eyebrow">{section.heading}</p> : null}
        <p className="sr-only">{list.join(", ")}</p>
        <MarqueeRow items={rowA} direction="right" />
        {rowB.length > 0 ? (
          <MarqueeRow items={rowB} direction="left" tight />
        ) : null}
        {section?.content?.trim() ? (
          <p
            className="mx-auto my-0 max-w-[36rem] text-[1.05rem] text-ink-faint"
            dangerouslySetInnerHTML={{ __html: inlineHtml(section.content) }}
          />
        ) : null}
      </div>
    </section>
  );
}
