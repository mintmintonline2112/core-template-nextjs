import { HeroSlides, type HeroSlide } from "@/app/(site)/_components/HeroSlides";
import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import { resolveImage } from "./shared";
import { metaOf, type StandardSectionProps } from "./section-content";

/** Giá trị thống kê: chữ số hiển thị lớn, ký tự ′ / + thu nhỏ (stat-suffix). */
function StatValue({ value }: { value: string }) {
  const count = /^\d/.test(value) ? Number.parseInt(value, 10) : undefined;
  const parts = value.split(/([′+])/).filter(Boolean);
  return (
    <dd data-count={count}>
      {parts.map((part, index) =>
        part === "′" || part === "+" ? (
          <span className="stat-suffix" key={index}>{part}</span>
        ) : (
          part
        ),
      )}
    </dd>
  );
}

const DEFAULT_SLIDES = [
  {
    image: "/images/orchard-rows.jpg",
    alt: "California almond orchard",
    title: "California Almonds. Sourced with Confidence.",
    text:
      "<p>Reliable California almond sourcing, procurement, and export coordination for wholesale buyers worldwide.</p>" +
      "<p>Prime Nuts USA connects international buyers with established growers, handlers, processors, and logistics partners throughout California. Tell us your required variety, grade, size, volume, packaging, and destination&mdash;we will identify suitable supply options and coordinate the purchasing process through shipment.</p>",
  },
  {
    image: "/images/hero-branch.jpg",
    alt: "Almonds ripening on the branch",
    title: "Sourced from California. Supplied to Your Requirements.",
    text: "<p>California is the center of the global almond industry, supported by an extensive network of experienced growers, handlers, processors, and exporters.</p>",
  },
  {
    image: "/images/container-ship.jpg",
    alt: "Container ship at a port terminal",
    title: "A Local Point of Contact for Your Almond Purchases",
    text: "<p>You send us your purchasing requirements, and our team identifies suitable supply options, coordinates commercial details, and follows the order through export preparation and cargo dispatch.</p>",
  },
];

const DEFAULT_STATS = [
  { label: "California Varieties", value: "4+" },
  { label: "Kernel Sizes", value: "6" },
  { label: "Steps to Shipment", value: "5" },
];

/** Mô tả nhập dạng văn bản thường trong admin → đoạn <p> (2 lần xuống dòng = đoạn mới). */
function toHtml(text: string): string {
  if (/^\s*</.test(text)) return text;
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph.replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/**
 * SECTION `hero-slider` — trang Home.
 * Hero dạng slider: ảnh nền chuyển slide, nội dung bên trái đổi theo slide, dãy số
 * slide bên phải; nút CTA và dải số liệu cố định.
 * CMS: subheading (eyebrow), heading + content (dùng cho slide thiếu tiêu đề / mô tả),
 * metadata.slides [{image,title,text,alt}], metadata.stats [{label,value}].
 * Hero tĩnh cũ vẫn giữ ở HeroStats.tsx (key hero-stats).
 */
export function HeroSlider({ section }: StandardSectionProps) {
  const cmsSlides = metaOf<Array<{ image?: string; title?: string; text?: string; alt?: string }>>(section, "slides")
    ?.filter((slide) => typeof slide.image === "string" && slide.image);
  const source = cmsSlides && cmsSlides.length > 0 ? cmsSlides : DEFAULT_SLIDES;

  const slides: HeroSlide[] = source.map((slide, index) => {
    const title = slide.title?.trim() || section?.heading || DEFAULT_SLIDES[0].title;
    const text = slide.text?.trim() || section?.content || (index === 0 ? DEFAULT_SLIDES[0].text : "");
    return {
      src: resolveImage(slide.image!),
      alt: slide.alt?.trim() || title,
      title,
      html: text ? sanitizeRichText(toHtml(text)) : "",
    };
  });

  const stats = (metaOf<Array<{ label?: string; value?: string }>>(section, "stats") ?? DEFAULT_STATS)
    .filter((stat) => stat.label && stat.value);

  return (
    <HeroSlides
      id={section?.sectionKey ?? "hero-slider"}
      eyebrow={section?.subheading ?? "California Almond Sourcing"}
      slides={slides}
    >
      <div className="hero-actions">
        <a href="#request-quote" className="btn btn-gold">Request a Quote</a>
        <a href="#product-specs" className="btn btn-ghost">Send Your Specifications</a>
      </div>

      {stats.length > 0 ? (
        <dl className="hero-stats reveal">
          {stats.map((stat) => (
            <div className="stat" key={stat.label}>
              <dt>{stat.label}</dt>
              <StatValue value={stat.value!} />
            </div>
          ))}
        </dl>
      ) : null}
    </HeroSlides>
  );
}
