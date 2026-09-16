import type { CSSProperties, ReactNode } from "react";
import { SourcingBlock } from "@/app/(site)/_components/SourcingBlock";
import { type SourcingSlide } from "@/app/(site)/_components/SourcingSlider";
import { Cta, Head, anchorId, items, layoutOf, resolveImage, str, type SectionProps } from "./shared";

const LAYOUTS = ["slider", "circles"] as const;

/** Icon nét cho từng bước theo thứ tự (viewBox 40×40) — lặp vòng nếu có thêm bước. */
const STEP_ICONS: ReactNode[] = [
  // 1. Gửi yêu cầu — bảng danh sách
  <><rect key="a" x="8" y="6" width="24" height="30" rx="2.5" /><path key="b" d="M15 6V4.5A1.5 1.5 0 0 1 16.5 3h7A1.5 1.5 0 0 1 25 4.5V6" /><path key="c" d="M14 16h12M14 22h12M14 28h7" /></>,
  // 2. Tìm nguồn — kính lúp + hạt hạnh nhân
  <><circle key="a" cx="17" cy="17" r="11" /><path key="b" d="m25 25 10 10" /><path key="c" d="M17 10.5c3 3 4.3 6.2 3.5 8.8-.7 2-6.3 2-7 0-.8-2.6.5-5.8 3.5-8.8z" /></>,
  // 3. Xem báo giá — tài liệu có dấu tick
  <><path key="a" d="M10 4h14l8 8v24a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" /><path key="b" d="M24 4v8h8" /><path key="c" d="m14 25 4 4 8-9" /></>,
  // 4. Xác nhận đơn — bút ký
  <><path key="a" d="M6 35h28" /><path key="b" d="M10 29 26 13l4 4-16 16h-4v-4z" /><path key="c" d="m22 17 4 4" /></>,
  // 5. Giao hàng — tàu container
  <><path key="a" d="M4 25h32l-4 10H8L4 25z" /><path key="b" d="M9 25v-7h7v7M16 25V13h8v12M24 25v-7h7v7" /><path key="c" d="M20 13V6" /></>,
];

/**
 * SECTION `steps` — quy trình làm việc theo bước.
 * layout `slider`:  nền navy, slider ảnh tự chạy + chuỗi ô bước bấm được
 *                   (bước N ↔ ảnh N) + nút CTA.
 * layout `circles`: các bước đánh số trong vòng tròn nối bằng đường cong nét đứt,
 *                   nền kem có bản đồ mờ.
 * CMS: heading, subheading, content, metadata.items [{title,text}],
 * slides [{image,caption,alt}] (slider), ctaLabel/ctaHref (slider).
 */
export function Steps({ section }: SectionProps) {
  const id = anchorId(section, "steps");
  const steps = items(section, "items")
    .filter((step) => step.title)
    .map((step) => ({ title: step.title, text: step.text }));

  if (layoutOf(section, LAYOUTS, "slider") === "circles") {
    return (
      <section className="section working-process" id={id}>
        <div className="container">
          <Head section={section} />
          {steps.length > 0 ? (
            <ol className="ps-steps reveal" style={{ ["--ps-count" as string]: steps.length } as CSSProperties}>
              {steps.map((step, index) => (
                <li className="ps-step" key={`${step.title}-${index}`}>
                  <div className="ps-circle">
                    <span className="ps-ring" aria-hidden="true">
                      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        {STEP_ICONS[index % STEP_ICONS.length]}
                      </svg>
                    </span>
                    <span className="ps-num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  {index < steps.length - 1 ? (
                    <svg className="ps-link" viewBox="0 0 100 44" preserveAspectRatio="none" aria-hidden="true">
                      <path
                        d={index % 2 === 0 ? "M0 22 C 30 46, 70 46, 100 22" : "M0 22 C 30 -2, 70 -2, 100 22"}
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  ) : null}
                  <h3>{step.title}</h3>
                  {step.text ? <p>{step.text}</p> : null}
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
      ? slideRows.map((slide) => ({ src: resolveImage(slide.image), caption: slide.caption, alt: slide.alt }))
      : undefined;
  const ctaLabel = str(section, "ctaLabel");

  return (
    <section className="section section-dark" id={id}>
      <div className="container">
        <Head section={section} light />
        {steps.length > 0 || slides ? <SourcingBlock slides={slides} chain={steps} /> : null}
        {ctaLabel ? (
          <p className="section-note section-note-light reveal">
            <Cta label={ctaLabel} href={str(section, "ctaHref")} className="btn btn-gold btn-sm" />
          </p>
        ) : null}
      </div>
    </section>
  );
}
