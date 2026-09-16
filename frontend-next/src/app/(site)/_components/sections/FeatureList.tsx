import {
  Head,
  Shell,
  anchorId,
  inlineHtml,
  items,
  layoutOf,
  resolveImage,
  str,
  strings,
  type SectionProps,
} from "./shared";

const LAYOUTS = ["split", "grid"] as const;

/** Ghi chú nhỏ in nghiêng dưới mỗi mục. */
const NOTE = "text-[0.82rem] text-ink-faint italic";

/**
 * SECTION `feature-list` — danh sách mục có ghi chú + dải chip.
 * layout `split`: mục đánh số kẹp hai bên ảnh tròn trung tâm (vòng nét đứt xoay),
 *                 dưới là dải câu mục tiêu + chip.
 * layout `grid`:  lưới mục có dấu tick + dải chip.
 * CMS: heading, subheading, content, metadata.items [{label,note}], chips [],
 * image (ảnh tròn trung tâm), note (câu trong dải chip).
 *
 * Đã chuyển sang Tailwind — `.doc-grid`, `.doc-note`, `.doc-features`,
 * `.doc-col*`, `.doc-num`, `.doc-body`, `.doc-center*`, `.incoterm-*` đã xoá
 * khỏi site.css. Hai thứ còn lại:
 * - `@keyframes doc-ring-spin` (Tailwind chỉ gọi được tên animation).
 * - class `doc-grid` vẫn giữ trên <ul> bố cục `grid`: SiteEffects.tsx bắt
 *   `.doc-grid.reveal` để rải `--reveal-delay` (hiện dần so le), và khối
 *   prefers-reduced-motion còn tắt transition cho `.doc-grid li`.
 * Dấu tick viết thẳng bằng Tailwind chứ không dùng class `.doc-check` — class
 * đó vẫn còn trong site.css vì forms.tsx (chưa chuyển) dùng.
 */
export function FeatureList({ section, index = 0 }: SectionProps) {
  const id = anchorId(section, "feature-list");
  const rows = items(section, "items")
    .map((row) => ({ label: row.label ?? row.title ?? "", note: row.note }))
    .filter((row) => row.label);
  const chips = strings(section, "chips");
  const note = str(section, "note");

  const band =
    note || chips.length > 0 ? (
      <div className="reveal mt-[2.6rem] flex flex-wrap items-center justify-between gap-6 rounded-lg border border-navy-100 bg-navy-50 px-8 py-[1.6rem] max-[640px]:flex-col max-[640px]:items-start">
        {note ? (
          <p
            className="m-0 max-w-[34rem] text-[1.05rem] text-ink-soft"
            dangerouslySetInnerHTML={{ __html: inlineHtml(note) }}
          />
        ) : null}
        {chips.length > 0 ? (
          <div className="flex gap-[0.7rem]">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded bg-navy-700 px-[1.4rem] py-[0.55rem] text-[0.95rem] font-semibold tracking-[0.14em] text-cream"
              >
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    ) : null;

  if (layoutOf(section, LAYOUTS, "split") === "grid") {
    return (
      <Shell tint={index % 2 === 1} id={id}>
        <Head section={section} />
        {rows.length > 0 ? (
          <ul className="doc-grid reveal grid grid-cols-4 gap-[0.9rem] max-[1080px]:grid-cols-2 max-[640px]:grid-cols-1">
            {rows.map((row) => (
              <li
                key={row.label}
                className="flex flex-wrap items-center gap-[0.8rem] rounded border border-line bg-paper px-[1.2rem] py-[1.05rem] text-[1.02rem] transition-[border-color,transform] duration-200 ease-brand hover:-translate-y-0.5 hover:border-gold-400"
              >
                <span
                  aria-hidden="true"
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-navy-100 bg-navy-50 text-[0.8rem] font-bold text-navy-700"
                >
                  ✓
                </span>
                {row.label}
                {row.note ? <span className={NOTE}>{row.note}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}
        {band}
      </Shell>
    );
  }

  const half = Math.ceil(rows.length / 2);
  const image = str(section, "image");
  // Cột trái lật ngược hướng để số nằm phía trong, quay mặt vào ảnh trung tâm;
  // dưới 900px xếp dọc nên trả về hướng thường.
  const column = (
    list: typeof rows,
    offset: number,
    side: "left" | "right",
  ) => (
    <ul className="flex flex-col gap-6">
      {list.map((row, i) => (
        <li
          key={row.label}
          className={
            side === "left"
              ? "flex flex-row-reverse items-center gap-4 text-right max-[900px]:flex-row max-[900px]:text-left"
              : "flex items-center gap-4"
          }
        >
          <span
            className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-full border border-gold-400 bg-paper font-display text-[1.02rem] font-semibold text-gold-500 italic shadow-soft"
            aria-hidden="true"
          >
            {String(offset + i + 1).padStart(2, "0")}
          </span>
          <div>
            <h4 className="m-0 text-[1.05rem]">{row.label}</h4>
            {row.note ? (
              <span className={`block ${NOTE} mt-[0.15rem] text-[0.88rem]`}>
                {row.note}
              </span>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <section className="section" id={id}>
      <div className="container">
        <Head section={section} />

        {rows.length > 0 ? (
          <div className="reveal mb-[clamp(2.5rem,5vw,3.5rem)] grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-[clamp(1.5rem,4vw,3rem)] max-[900px]:grid-cols-1 max-[900px]:gap-y-8">
            {column(rows.slice(0, half), 0, "left")}
            <div className="flex justify-center max-[900px]:order-[-1]">
              {/* ::before = vòng nét đứt xoay quanh ảnh (ảnh đứng yên); rê chuột
                  vào thì xoay nhanh hơn — đổi 26s/9s để chỉnh tốc độ. */}
              <div className='relative aspect-square w-[clamp(220px,24vw,320px)] rounded-full p-[14px] before:pointer-events-none before:absolute before:inset-0 before:animate-[doc-ring-spin_26s_linear_infinite] before:rounded-full before:border before:border-dashed before:border-gold-400 before:content-[""] hover:before:[animation-duration:9s]'>
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveImage(image)}
                    alt=""
                    loading="lazy"
                    className="h-full w-full rounded-full object-cover shadow-lift"
                  />
                ) : null}
              </div>
            </div>
            {column(rows.slice(half), half, "right")}
          </div>
        ) : null}

        {band}
      </div>
    </section>
  );
}
