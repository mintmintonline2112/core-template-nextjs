import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/utils/cn";

/**
 * Mảnh giao diện dùng chung toàn site (section CMS lẫn trang dựng tay):
 * chuỗi class Tailwind đặt tên + vài component nhỏ. Class "móc" đi kèm
 * (`photo-frame`, `section-flow`, `eyebrow`) không mang style riêng — chúng
 * là điểm bám cho effects.css / SiteEffects.tsx hoặc cho section kề bên.
 */

/** Khoảng đệm dọc chuẩn của mọi section. */
export const SECTION = "py-(--section-pad)";

/** Nền kem chuyển dần + viền trên/dưới. */
export const SECTION_TINT =
  "border-y border-y-line-soft bg-[linear-gradient(180deg,var(--cream-2)_0%,var(--cream)_100%)]";

/** Nền navy đậm, chữ sáng. */
export const SECTION_DARK =
  "bg-[radial-gradient(110%_80%_at_15%_0%,color-mix(in_oklab,var(--navy-600)_50%,transparent)_0%,transparent_55%),linear-gradient(200deg,var(--navy-800)_0%,var(--navy-900)_85%)] text-light";

/**
 * Hai section cùng mang class này đứng liền nhau trong CMS thì nối thành một
 * mảng: section sau bỏ khoảng đệm trên + viền trên, nền kem phẳng; section
 * trước bỏ viền dưới.
 */
export const SECTION_FLOW =
  "section-flow [.section-flow+&]:border-t-0 [.section-flow+&]:bg-cream [.section-flow+&]:bg-none [.section-flow+&]:pt-0 has-[+.section-flow]:border-b-0";

/** Dòng ghi chú in nghiêng căn giữa cuối khối. */
export const SECTION_NOTE =
  "mx-auto mt-12 mb-0 max-w-160 text-center font-display text-base text-ink-faint italic";

/**
 * Khung ảnh bo góc: rê chuột thì viền vàng, ảnh sáng lên, phủ tối nhẹ đáy ảnh.
 * `photo-frame` là móc cho hiệu ứng cuộn (effects.css + GSAP trong SiteEffects.tsx).
 */
export const PHOTO_FRAME =
  "photo-frame relative m-0 overflow-hidden rounded-lg border border-line bg-paper shadow-lift transition-[border-color,box-shadow] duration-300 ease-brand hover:border-gold-400 after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(180deg,transparent_55%,color-mix(in_oklab,var(--navy-900)_38%,transparent))] after:opacity-0 after:transition-opacity after:duration-350 after:ease-brand after:content-[''] hover:after:opacity-100 [&_img]:block [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_img]:transition-[filter] [&_img]:duration-350 [&_img]:ease-brand hover:[&_img]:[filter:brightness(1.08)_saturate(1.12)]";

/** Ảnh ngang lớn đầu khối (dùng cùng PHOTO_FRAME). */
export const SECTION_PHOTO = "mb-[clamp(2rem,4vw,3rem)] aspect-21/9";

/** Vòm cong phía trên — nhắc lại dáng khung hero, motif chữ ký của site. */
export const ARCH = "rounded-[240px_240px_var(--radius-lg)_var(--radius-lg)]";

/** Hoa văn hạt hạnh nhân mờ (::before) cho dải navy — phần tử phải `relative`. */
export const NAVY_PATTERN =
  "before:pointer-events-none before:absolute before:inset-0 before:bg-(image:--pattern-almonds) before:content-['']";

/** Hạt phim mịn (::after) phủ dải navy — phần tử phải `relative`. */
export const NAVY_GRAIN =
  "after:pointer-events-none after:absolute after:inset-0 after:bg-(image:--texture-grain) after:opacity-6 after:content-['']";

/** Mô tả hero từ CMS trên nền navy: đoạn đầu to + sáng (lead), các đoạn sau nhỏ + dịu. */
export const HERO_TEXT =
  "[&>p]:max-w-[36rem] [&>p]:text-base [&>p]:text-light-soft [&>p:first-child]:text-xl [&>p:first-child]:text-light";

/**
 * Eyebrow đứng trên tiêu đề (section, hero, page-hero) mặc định ẩn toàn site —
 * "Sếp không thích subtitle". Section nào tick "Hiện eyebrow" trong admin
 * (metadata.showEyebrow) thì vẫn hiện riêng section đó. Đổi `false` là hiện lại tất cả.
 */
const HIDE_HEADING_EYEBROWS = true;

/**
 * Chữ nhỏ viết hoa giãn rộng + gạch vàng bên dưới (gạch tự vẽ ra khi khối hiện).
 * `heading` = eyebrow đứng trên tiêu đề, theo quy ước HIDE_HEADING_EYEBROWS.
 * `show`    = vẫn hiện dù là eyebrow trên tiêu đề (section tick "Hiện eyebrow").
 * `center`  = eyebrow đứng một mình làm tiêu đề dải (gạch căn giữa).
 */
export function Eyebrow({
  children,
  gold = false,
  center = false,
  heading = false,
  show = false,
  className,
}: {
  children: ReactNode;
  gold?: boolean;
  center?: boolean;
  heading?: boolean;
  show?: boolean;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "eyebrow m-0 mb-4 text-xs font-semibold tracking-2xl uppercase after:mt-4 after:block after:h-px after:w-12 after:bg-gold-400 after:content-['']",
        gold ? "text-gold-300" : "text-navy-700",
        center && "inline-block after:mx-auto",
        heading && HIDE_HEADING_EYEBROWS && !show && "hidden",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Ảnh nền dải tiêu đề đầu trang khi trang chưa chọn ảnh (Admin → Trang). */
export const DEFAULT_PAGE_HERO_IMAGE = "/images/orchard-rows.jpg";

/**
 * Dải tiêu đề đầu trang con (Products, News, bài viết, Contact, trang CMS tự do):
 * ảnh nền nhoè nhẹ + lớp navy đậm bên trái (chữ dễ đọc) nhạt dần sang phải +
 * hạt phim. Ảnh chọn trong Admin → Trang (kèm điểm lấy nét), trống thì dùng
 * DEFAULT_PAGE_HERO_IMAGE. h1 mang `data-headline` để SiteEffects.tsx tách chữ.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  titleStyle,
  image,
  imagePosition,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  titleStyle?: CSSProperties;
  /** URL ảnh nền đã resolve (heroImageUrl); trống = ảnh mặc định. */
  image?: string | null;
  /** CSS object-position, VD "50% 62%". */
  imagePosition?: string | null;
}) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden bg-navy-900 text-light",
        NAVY_GRAIN,
      )}
    >
      {/* Phóng nhẹ (scale-110) để mép ảnh nhoè không lộ viền sáng quanh khung. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image || DEFAULT_PAGE_HERO_IMAGE}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        className="absolute inset-0 -z-2 h-full w-full scale-110 object-cover blur-xs"
        style={imagePosition ? { objectPosition: imagePosition } : undefined}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-1 bg-linear-to-r from-navy-900/95 via-navy-900/80 to-navy-900/40 max-[640px]:via-navy-900/85 max-[640px]:to-navy-900/70"
      />
      <div className="relative site-container max-w-[52rem] py-[clamp(4rem,8vw,6.5rem)]">
        {eyebrow ? (
          <Eyebrow gold heading className="reveal">
            {eyebrow}
          </Eyebrow>
        ) : null}
        <h1
          data-headline
          className="reveal mb-[0.4em] text-h1 text-light"
          style={titleStyle}
        >
          {title}
        </h1>
        {lead ? (
          <p className="reveal mb-0 max-w-[40rem] text-xl text-light-soft">
            {lead}
          </p>
        ) : null}
      </div>
    </section>
  );
}

/** Dải kêu gọi hành động cuối trang: eyebrow + tiêu đề + câu dẫn + hàng nút. */
export function CtaBand({
  eyebrow,
  title,
  text,
  children,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  text: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-[radial-gradient(120%_100%_at_15%_100%,color-mix(in_oklab,var(--navy-600)_50%,transparent)_0%,transparent_55%),linear-gradient(160deg,var(--navy-900)_0%,var(--navy-800)_100%)] py-[clamp(3.5rem,7vw,5.5rem)] text-center text-light",
        NAVY_GRAIN,
      )}
    >
      <div className="reveal site-container">
        <Eyebrow
          center
          className="mx-auto mt-0 mb-8 max-w-[36rem] text-lg text-light-soft"
        >
          {eyebrow}
        </Eyebrow>
        <h2 className="mx-auto max-w-[34rem] text-h3 text-light">{title}</h2>
        <p className="mx-auto mt-0 mb-8 max-w-[36rem] text-lg text-light-soft">
          {text}
        </p>
        <div className="flex flex-wrap justify-center gap-4 max-[640px]:flex-col max-[640px]:items-center">
          {children}
        </div>
      </div>
    </section>
  );
}
