import type { CSSProperties, ReactNode } from "react";
import { SourcingBlock } from "@/app/(site)/_components/SourcingBlock";
import { type SourcingSlide } from "@/app/(site)/_components/SourcingSlider";
import {
  Cta,
  Head,
  anchorId,
  items,
  layoutOf,
  resolveImage,
  str,
  type SectionProps,
} from "./shared";

const LAYOUTS = ["slider", "circles"] as const;

/** Icon nét cho từng bước theo thứ tự (viewBox 40×40) — lặp vòng nếu có thêm bước. */
const STEP_ICONS: ReactNode[] = [
  // 1. Gửi yêu cầu — bảng danh sách
  <>
    <rect key="a" x="8" y="6" width="24" height="30" rx="2.5" />
    <path key="b" d="M15 6V4.5A1.5 1.5 0 0 1 16.5 3h7A1.5 1.5 0 0 1 25 4.5V6" />
    <path key="c" d="M14 16h12M14 22h12M14 28h7" />
  </>,
  // 2. Tìm nguồn — kính lúp + hạt hạnh nhân
  <>
    <circle key="a" cx="17" cy="17" r="11" />
    <path key="b" d="m25 25 10 10" />
    <path
      key="c"
      d="M17 10.5c3 3 4.3 6.2 3.5 8.8-.7 2-6.3 2-7 0-.8-2.6.5-5.8 3.5-8.8z"
    />
  </>,
  // 3. Xem báo giá — tài liệu có dấu tick
  <>
    <path
      key="a"
      d="M10 4h14l8 8v24a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
    />
    <path key="b" d="M24 4v8h8" />
    <path key="c" d="m14 25 4 4 8-9" />
  </>,
  // 4. Xác nhận đơn — bút ký
  <>
    <path key="a" d="M6 35h28" />
    <path key="b" d="M10 29 26 13l4 4-16 16h-4v-4z" />
    <path key="c" d="m22 17 4 4" />
  </>,
  // 5. Giao hàng — tàu container
  <>
    <path key="a" d="M4 25h32l-4 10H8L4 25z" />
    <path key="b" d="M9 25v-7h7v7M16 25V13h8v12M24 25v-7h7v7" />
    <path key="c" d="M20 13V6" />
  </>,
];

/**
 * Bản đồ thế giới mờ lót nền khối `circles` (::before của section — không chiếm
 * chỗ, không bắt chuột).
 */
const MAP_BACKDROP =
  'before:pointer-events-none before:absolute before:inset-x-[3%] before:inset-y-[6%] before:bg-[url(/images/world-map.svg)] before:bg-contain before:bg-center before:bg-no-repeat before:opacity-[0.07] before:content-[""]';

/**
 * SECTION `steps` — quy trình làm việc theo bước.
 * layout `slider`:  nền navy, slider ảnh tự chạy + chuỗi ô bước bấm được
 *                   (bước N ↔ ảnh N) + nút CTA.
 * layout `circles`: các bước đánh số trong vòng tròn nối bằng đường cong nét đứt,
 *                   nền kem có bản đồ mờ.
 * CMS: heading, subheading, content, metadata.items [{title,text}],
 * slides [{image,caption,alt}] (slider), ctaLabel/ctaHref (slider).
 *
 * Bố cục `circles` đã chuyển sang Tailwind — `.working-process`, `.ps-step`,
 * `.ps-circle`, `.ps-ring`, `.ps-num`, `.ps-link` đã xoá khỏi site.css. Ba thứ
 * còn lại ở site.css: `@keyframes ps-dash` (Tailwind chỉ gọi tên animation),
 * hai rule `html.js .ps-steps.reveal > *` (hiện dần so le — SiteEffects.tsx bắt
 * `.ps-steps.reveal` để rải `--reveal-delay`, nên GIỮ class `ps-steps`), và
 * `--ps-count` vẫn truyền bằng inline style vì số bước do CMS quyết định.
 * Bố cục `slider` (SourcingBlock + `.btn*` + `.section-note*`) chưa chuyển.
 */
export function Steps({ section }: SectionProps) {
  const id = anchorId(section, "steps");
  const steps = items(section, "items")
    .filter((step) => step.title)
    .map((step) => ({ title: step.title, text: step.text }));

  if (layoutOf(section, LAYOUTS, "slider") === "circles") {
    return (
      <section
        className={`section relative overflow-hidden border-y border-line-soft bg-cream-2 ${MAP_BACKDROP}`}
        id={id}
      >
        <div className="relative container">
          <Head section={section} />
          {steps.length > 0 ? (
            <ol
              className="ps-steps reveal mt-[clamp(0.5rem,2vw,1.5rem)]! grid grid-cols-[repeat(var(--ps-count,5),minmax(0,1fr))] gap-x-[var(--ps-gap)] gap-y-[2.8rem] [--ps-gap:clamp(1rem,2.4vw,2rem)] [--ps-size:132px] max-[1080px]:grid-cols-3 max-[1080px]:[--ps-size:116px] max-[640px]:grid-cols-1 max-[640px]:gap-[2.4rem]"
              style={
                { ["--ps-count" as string]: steps.length } as CSSProperties
              }
            >
              {steps.map((step, index) => (
                <li
                  className="group relative text-center"
                  key={`${step.title}-${index}`}
                >
                  <div className="relative z-1 mx-auto mb-[1.6rem] h-[var(--ps-size)] w-[var(--ps-size)] rounded-full bg-paper shadow-[0_18px_40px_-22px_rgba(15,23,41,0.35)]">
                    <span
                      className="absolute inset-[11px] grid place-items-center rounded-full border border-dashed border-navy-600 text-navy-700 transition-[background-color,color,border-color] duration-300 ease-brand group-hover:border-gold-400 group-hover:bg-navy-700 group-hover:text-gold-300"
                      aria-hidden="true"
                    >
                      <svg
                        viewBox="0 0 40 40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-[46px] w-[46px]"
                      >
                        {STEP_ICONS[index % STEP_ICONS.length]}
                      </svg>
                    </span>
                    <span
                      className="absolute top-[2px] -right-[4px] grid h-10 w-10 place-items-center rounded-full border-[3px] border-cream-2 bg-navy-700 font-display text-[0.85rem] font-bold text-gold-300"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  {/* Đường nối: từ mép phải vòng tròn này tới mép trái vòng tròn kế tiếp */}
                  {index < steps.length - 1 ? (
                    <svg
                      className="pointer-events-none absolute top-[calc(var(--ps-size)/2_-_22px)] left-[calc(50%_+_var(--ps-size)/2)] h-[44px] w-[calc(100%_+_var(--ps-gap)_-_var(--ps-size))] animate-[ps-dash_1.8s_linear_infinite] overflow-visible fill-none stroke-navy-600 stroke-[1.5] [stroke-dasharray:4_5] motion-reduce:animate-none max-[1080px]:hidden"
                      viewBox="0 0 100 44"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path
                        d={
                          index % 2 === 0
                            ? "M0 22 C 30 46, 70 46, 100 22"
                            : "M0 22 C 30 -2, 70 -2, 100 22"
                        }
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  ) : null}
                  <h3 className="mb-[0.55rem]! text-[1.22rem] text-ink!">
                    {step.title}
                  </h3>
                  {step.text ? (
                    <p className="mx-auto! my-0! max-w-[16rem] text-[0.98rem] leading-[1.6] text-ink-soft">
                      {step.text}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </section>
    );
  }

  // undefined = chưa cấu hình ảnh → SourcingBlock dùng bộ ảnh mặc định của widget.
  const slideRows = items(section, "slides").filter((slide) => slide.image);
  const slides: SourcingSlide[] | undefined =
    slideRows.length > 0
      ? slideRows.map((slide) => ({
          src: resolveImage(slide.image),
          caption: slide.caption,
          alt: slide.alt,
        }))
      : undefined;
  const ctaLabel = str(section, "ctaLabel");

  return (
    <section className="section section-dark" id={id}>
      <div className="container">
        <Head section={section} light />
        {steps.length > 0 || slides ? (
          <SourcingBlock slides={slides} chain={steps} />
        ) : null}
        {ctaLabel ? (
          <p className="section-note section-note-light reveal">
            <Cta
              label={ctaLabel}
              href={str(section, "ctaHref")}
              className="btn btn-gold btn-sm"
            />
          </p>
        ) : null}
      </div>
    </section>
  );
}
