import {
  Head,
  IconBadge,
  anchorId,
  iconFor,
  items,
  type SectionProps,
} from "./shared";

/**
 * SECTION `feature-cards` — lưới thẻ icon + tiêu đề + mô tả, luôn nền navy.
 * (Thẻ trên nền kem/paper — VD bố cục `names` của MediaCards.tsx — vẫn dùng
 * `.why-grid`/`.why-card` gốc, còn ở site.css.) `.why-us .why-card` (biến thể
 * navy, chỉ component này dùng) đã xoá khỏi site.css, style thẳng bằng Tailwind.
 * CMS: heading, subheading, content, metadata.items [{title,text,icon}]
 * (icon: tên trong bộ icon chung; trống thì xoay vòng theo thứ tự thẻ).
 *
 * Vẫn GIỮ class `why-grid` trên lưới (giá trị Tailwind copy y hệt CSS cũ) —
 * SiteEffects.tsx bắt `.why-grid` để so le hiệu ứng hiện dần từng thẻ. Icon
 * badge KHÔNG giữ class `icon-badge` gốc (nền/viền/màu đổi hẳn cho thẻ navy,
 * ghi đè qua class dùng chung — utilities layer thua legacy — sẽ không thắng)
 * nên viết lại đầy đủ hình dạng gốc bằng Tailwind. `tilt-card` (mới, không
 * kèm style) thay `why-card` để SiteEffects.tsx vẫn nghiêng thẻ theo chuột.
 */
export function FeatureCards({ section }: SectionProps) {
  const cards = items(section, "items").filter((card) => card.title);

  return (
    <section
      className="section section-tint"
      id={anchorId(section, "feature-cards")}
    >
      <div className="container">
        <Head section={section} />

        {cards.length > 0 ? (
          <div className="why-grid grid grid-cols-3 gap-[1.4rem]">
            {cards.map((card, index) => (
              <article
                className="tilt-card group reveal rounded-lg border border-[rgba(217,180,95,.28)] bg-navy-700 px-[1.8rem] pt-8 pb-[1.7rem] shadow-lift transition-[transform,border-color] duration-250 ease-brand hover:-translate-y-1 hover:border-gold-400"
                key={`${card.title}-${index}`}
              >
                <IconBadge className="mb-[1.3rem] inline-flex h-13 w-13 shrink-0 items-center justify-center rounded-full border border-[rgba(245,241,227,.30)] bg-[rgba(245,241,227,.10)] text-light group-hover:scale-110 group-hover:rotate-[-5deg] [&>svg]:h-6 [&>svg]:w-6">
                  {iconFor(card.icon, index)}
                </IconBadge>
                <h3 className="mb-[0.4rem]! text-[1.4rem] text-light!">
                  {card.title}
                </h3>
                {card.text ? (
                  <p className="m-0! text-[1.02rem] text-[rgba(245,241,227,.88)]">
                    {card.text}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
