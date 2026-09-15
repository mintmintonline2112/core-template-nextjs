import type { ReactNode } from "react";
import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import { HOW_IT_WORKS_STEPS } from "./HowItWorks";
import { metaOf, type StandardSectionProps } from "./section-content";

export type WorkingStep = { title: string; text?: string };

/** Icon nét cho từng bước theo thứ tự (viewBox 40×40) — lặp vòng nếu có thêm bước. */
const STEP_ICONS: Array<{ icon: ReactNode }> = [
  // 1. Gửi yêu cầu — bảng danh sách
  { icon: <><rect x="8" y="6" width="24" height="30" rx="2.5" /><path d="M15 6V4.5A1.5 1.5 0 0 1 16.5 3h7A1.5 1.5 0 0 1 25 4.5V6" /><path d="M14 16h12M14 22h12M14 28h7" /></> },
  // 2. Tìm nguồn — kính lúp + hạt hạnh nhân
  { icon: <><circle cx="17" cy="17" r="11" /><path d="m25 25 10 10" /><path d="M17 10.5c3 3 4.3 6.2 3.5 8.8-.7 2-6.3 2-7 0-.8-2.6.5-5.8 3.5-8.8z" /></> },
  // 3. Xem báo giá — tài liệu có dấu tick
  { icon: <><path d="M10 4h14l8 8v24a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" /><path d="M24 4v8h8" /><path d="m14 25 4 4 8-9" /></> },
  // 4. Xác nhận đơn — bút ký
  { icon: <><path d="M6 35h28" /><path d="M10 29 26 13l4 4-16 16h-4v-4z" /><path d="m22 17 4 4" /></> },
  // 5. Giao hàng — tàu container
  { icon: <><path d="M4 25h32l-4 10H8L4 25z" /><path d="M9 25v-7h7v7M16 25V13h8v12M24 25v-7h7v7" /><path d="M20 13V6" /></> },
];

/**
 * Phần giao diện của Working Process: các bước trong vòng tròn đánh số, nối
 * nhau bằng đường cong nét đứt (lên/xuống xen kẽ), nền kem có bản đồ thế giới mờ.
 */
export function WorkingProcessBlock({
  id,
  eyebrow,
  heading,
  intro,
  steps,
}: {
  id: string;
  eyebrow?: string | null;
  heading?: string | null;
  /** HTML rich-text từ CMS (sẽ được sanitize). */
  intro?: string | null;
  steps: WorkingStep[];
}) {
  if (steps.length === 0) return null;

  return (
    <section className="section working-process" id={id}>
      <div className="container">
        {eyebrow || heading || intro ? (
          <div className="section-head reveal">
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            {heading ? <h2>{heading}</h2> : null}
            {intro ? (
              <div className="section-intro" dangerouslySetInnerHTML={{ __html: sanitizeRichText(intro) }} />
            ) : null}
          </div>
        ) : null}

        <ol
          className="ps-steps reveal"
          style={{ ["--ps-count" as string]: steps.length } as React.CSSProperties}
        >
          {steps.map((step, index) => (
            <li className="ps-step" key={step.title}>
              <div className="ps-circle">
                <span className="ps-ring" aria-hidden="true">
                  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    {STEP_ICONS[index % STEP_ICONS.length].icon}
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
      </div>
    </section>
  );
}

/**
 * SECTION `working-process` — trang Home (ngay dưới how-it-works).
 * CMS: heading, subheading (eyebrow), content (intro), metadata.steps [{title,text}].
 * CMS chưa có bước → dùng 5 bước How It Works mặc định.
 */
export function WorkingProcess({ section }: StandardSectionProps) {
  const cmsSteps = metaOf<Array<{ title?: string; text?: string }>>(section, "steps")
    ?.filter((step) => step.title)
    .map((step) => ({ title: step.title!, text: step.text ?? "" }));

  return (
    <WorkingProcessBlock
      id={section?.sectionKey ?? "working-process"}
      eyebrow={section?.subheading ?? "Working Process"}
      heading={section?.heading ?? "From Requirements to Shipment"}
      intro={section?.content}
      steps={cmsSteps && cmsSteps.length > 0 ? cmsSteps : HOW_IT_WORKS_STEPS}
    />
  );
}
