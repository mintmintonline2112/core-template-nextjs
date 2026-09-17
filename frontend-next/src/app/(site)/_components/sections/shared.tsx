import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/utils/cn";
import {
  Eyebrow,
  SECTION,
  SECTION_DARK,
  SECTION_FLOW,
  SECTION_TINT,
} from "@/app/(site)/_components/ui";
import { mediaUrl } from "@/app/(site)/_lib/cms";
import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import type { PageSection } from "@/types/cms";

/**
 * Đồ dùng chung cho MỌI section component (thư mục này).
 *
 * MÔ HÌNH: một component = một BỐ CỤC (layout family), đặt tên theo hình dạng
 * (hero, marquee, faq, media-cards…) chứ không theo nội dung. Biến thể hiển thị
 * là `metadata.layout` — đổi layout thì dữ liệu giữ nguyên. Nội dung (chữ, ảnh,
 * danh sách) chỉ nằm trong CMS / seed; component KHÔNG có nội dung mặc định,
 * thiếu dữ liệu thì bỏ trống phần đó.
 *
 * `section` có thể thiếu (trang dựng tay) — mọi helper đều chịu null.
 *
 * GIAO DIỆN viết bằng class Tailwind ngay trong JSX. Chuỗi class dùng chung
 * nhiều nơi (nền section, khung ảnh, ghi chú…) và Eyebrow nằm ở
 * `_components/ui.tsx`. Ba file CSS còn lại và vai trò — xem đầu
 * styles/tailwind.css. Điều duy nhất cần nhớ: `.reveal` / `.reveal-group`
 * thuộc layer effects (thắng class Tailwind), nên đừng đặt opacity /
 * transform / transition lên chính phần tử đó.
 */
export type SectionProps = { section?: PageSection | null; index?: number };

export type Meta = Record<string, unknown>;

export const meta = (section?: PageSection | null): Meta =>
  (section?.metadata ?? {}) as Meta;

/** Section tick "Hiện eyebrow" trong admin → hiện eyebrow dù toàn site đang ẩn (HIDE_HEADING_EYEBROWS). */
export const showsEyebrow = (section?: PageSection | null): boolean =>
  meta(section).showEyebrow === true;

/** metadata[key] nguyên bản, `undefined` khi thiếu / null. */
export function metaOf<T>(
  section: PageSection | null | undefined,
  key: string,
): T | undefined {
  const value = meta(section)[key];
  return value === undefined || value === null ? undefined : (value as T);
}

/** metadata[key] dạng chuỗi đã trim, rỗng → undefined. */
export function str(
  section: PageSection | null | undefined,
  key: string,
): string | undefined {
  const value = meta(section)[key];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

/** metadata[key] dạng mảng chuỗi (lọc rác). */
export function strings(
  section: PageSection | null | undefined,
  key: string,
): string[] {
  const raw = meta(section)[key];
  return Array.isArray(raw)
    ? raw
        .filter((v): v is string => typeof v === "string" && !!v.trim())
        .map((v) => v.trim())
    : [];
}

/**
 * metadata[key] dạng mảng object có giá trị chuỗi. Item là chuỗi (dữ liệu cũ)
 * được nâng thành {title,label} để mọi layout đọc được.
 */
export function items(
  section: PageSection | null | undefined,
  key: string,
): Array<Record<string, string>> {
  const raw = meta(section)[key];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string")
        return item.trim() ? { label: item.trim(), title: item.trim() } : null;
      if (item && typeof item === "object") {
        const out: Record<string, string> = {};
        for (const [k, v] of Object.entries(item as Meta)) {
          if (typeof v === "string" && v.trim()) out[k] = v.trim();
        }
        return out;
      }
      return null;
    })
    .filter(
      (item): item is Record<string, string> =>
        !!item && Object.keys(item).length > 0,
    );
}

/** metadata.layout nếu thuộc danh sách cho phép, không thì layout mặc định. */
export function layoutOf<L extends string>(
  section: PageSection | null | undefined,
  allowed: readonly L[],
  fallback: L,
): L {
  const raw = str(section, "layout");
  return raw && (allowed as readonly string[]).includes(raw)
    ? (raw as L)
    : fallback;
}

/** id neo trên trang = section key; thiếu section thì dùng tên component. */
export const anchorId = (
  section: PageSection | null | undefined,
  fallback: string,
) => section?.sectionKey ?? fallback;

/** /images/... là ảnh tĩnh của frontend; còn lại (uploads/...) trỏ về backend. */
export const resolveImage = (path: string) =>
  path.startsWith("/images/") ? path : (mediaUrl(path) ?? path);

/** Văn bản thường → đoạn <p> (2 lần xuống dòng = đoạn mới); đã là HTML thì giữ nguyên. */
export function toHtml(text: string): string {
  if (/^\s*</.test(text)) return text;
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph) =>
        `<p>${paragraph.replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
}

/** Tách văn bản thường thành các đoạn (2 lần xuống dòng). */
export const paragraphs = (text: string) =>
  text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

/**
 * HTML nội dòng đã sanitize để nhét vào <p>: chuỗi thường giữ nguyên, HTML một
 * đoạn thì bỏ thẻ <p> bao ngoài (tránh <p> lồng <p>).
 */
export function inlineHtml(text: string): string {
  const clean = sanitizeRichText(text.trim());
  const single = clean.match(/^<p>([\s\S]*)<\/p>$/);
  return single && !single[1].includes("<p") ? single[1] : clean;
}

/* ---------- Icon ---------- */

/** Bộ icon nét (viewBox 24) — item đặt `icon: '<tên>'`; không có thì xoay vòng theo thứ tự. */
export const ICONS: Record<string, ReactNode> = {
  pin: (
    <>
      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  leaf: (
    <path d="M12 2c1 4-1 7-4 9 4 0 7-2 8-6 .8 5-2 10-8 11C4 15 4 8 8 5c-1 3 0 5 1 6 0-4 1-7 3-9z" />
  ),
  scale: (
    <>
      <path d="M12 4v16M5 8l7-4 7 4" />
      <path d="M5 8l-2.5 6a3.5 3.5 0 0 0 7 0L7 8M19 8l-2.5 6a3.5 3.5 0 0 0 7 0L21 8" />
      <path d="M8 20h8" />
    </>
  ),
  tune: (
    <>
      <path d="M4 21v-4M4 13v-2M4 7V3M12 21v-8M12 9V3M20 21v-2M20 15V3" />
      <circle cx="4" cy="15" r="2" />
      <circle cx="12" cy="11" r="2" />
      <circle cx="20" cy="17" r="2" />
    </>
  ),
  ship: <path d="M3 17h18l-2 4H5l-2-4zM6 17V9l4-2v10M14 17V7l4 2v8" />,
  heart: (
    <path d="M12 21c-5-3.5-8-7-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 4-3 7.5-8 11z" />
  ),
  almond: (
    <>
      <path d="M12 3.5 C 16 7.5 18.5 12 17.2 15.9 C 16.2 18.9 7.8 18.9 6.8 15.9 C 5.5 12 8 7.5 12 3.5 Z" />
      <path d="M12 7.2 C 13.8 9.6 14.9 12.1 14.3 14.5" />
    </>
  ),
  product: (
    <>
      <path d="M12 3c3.5 3.6 5.6 7.6 4.5 11-1 3-8 3-9 0C6.4 10.6 8.5 6.6 12 3z" />
      <path d="M12 7c1.6 2.2 2.4 4.4 2 6.4" />
    </>
  ),
  ruler: (
    <>
      <rect x="2.5" y="8" width="19" height="8" rx="1" />
      <path d="M6.5 8v3M10.5 8v4M14.5 8v3M18.5 8v4" />
    </>
  ),
  grade: (
    <>
      <circle cx="12" cy="10" r="6.5" />
      <path d="m9.2 10 2 2 3.6-3.8M8.5 15.5 7 21l5-2.5 5 2.5-1.5-5.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="1.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  box: (
    <>
      <path d="M12 3 3.5 7v10L12 21l8.5-4V7L12 3z" />
      <path d="M3.5 7 12 11l8.5-4M12 11v10" />
    </>
  ),
  pallet: (
    <>
      <rect x="2.5" y="7" width="19" height="11" rx="1" />
      <path d="M6.5 7v11M10.5 7v11M14.5 7v11M18.5 7v11" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V8l8-5 8 5v13" />
      <path d="M8 21v-8h8v8M3 21h18" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 7 8.5-7" />
    </>
  ),
  phone: (
    <path d="M5 4h4l1.8 4.5-2.3 1.7a13 13 0 0 0 5.3 5.3l1.7-2.3L20 15v4a1.5 1.5 0 0 1-1.6 1.5C10.8 20 4 13.2 3.5 5.6A1.5 1.5 0 0 1 5 4z" />
  ),
  blanched: (
    <>
      <path d="M12 3.5 C 16 7.5 18.5 12 17.2 15.9 C 16.2 18.9 7.8 18.9 6.8 15.9 C 5.5 12 8 7.5 12 3.5 Z" />
      <path d="M19.5 4.5v3M18 6h3" />
    </>
  ),
  sliced: (
    <>
      <ellipse cx="9" cy="12" rx="4" ry="8" />
      <ellipse cx="15" cy="12" rx="4" ry="8" opacity="0.55" />
    </>
  ),
  slivered: <path d="M6 20 9 4M11.5 20 14.5 4M17 20 20 4" />,
  diced: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" />
    </>
  ),
  flour: (
    <>
      <path d="M4 19c0-5 3.6-8.5 8-8.5s8 3.5 8 8.5H4z" />
      <circle cx="9" cy="6" r="0.4" />
      <circle cx="13.5" cy="4.5" r="0.4" />
      <circle cx="16.5" cy="7.5" r="0.4" />
      <circle cx="12" cy="8" r="0.4" />
    </>
  ),
};

/** Thứ tự xoay vòng khi item không đặt tên icon. */
export const ICON_CYCLE = [
  "pin",
  "leaf",
  "scale",
  "tune",
  "ship",
  "heart",
] as const;

export function iconFor(name: string | undefined, index: number): ReactNode {
  return (name && ICONS[name]) ?? ICONS[ICON_CYCLE[index % ICON_CYCLE.length]];
}

export const ALMOND_ICON = ICONS.almond;

/** Huy hiệu tròn chứa icon; `className` ghép đè (đổi cỡ, màu, hiệu ứng hover). */
export function IconBadge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-13 w-13 shrink-0 items-center justify-center rounded-full border border-navy-100 bg-navy-50 text-navy-700 transition-transform duration-250 ease-brand motion-reduce:transition-none [&>svg]:h-6 [&>svg]:w-6",
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </span>
  );
}

/* ---------- Khung & đầu khối ---------- */

/** Kiểu chữ đoạn giới thiệu dưới tiêu đề section. */
const INTRO = "max-w-176 text-lg text-ink-soft [&_p:last-child]:mb-0";

/** Đoạn intro rich-text (đã sanitize); rỗng thì không render. */
export function RichIntro({
  html,
  className = INTRO,
}: {
  html: string | null | undefined;
  className?: string;
}) {
  if (!html?.trim()) return null;
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }}
    />
  );
}

/** Dòng ghi chú một đoạn (chuỗi thường hoặc HTML nội dòng có link) trong <p>. */
export function InlineNote({
  text,
  className,
  style,
}: {
  text: string | undefined;
  className: string;
  style?: CSSProperties;
}) {
  if (!text) return null;
  return (
    <p
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: inlineHtml(text) }}
    />
  );
}

/** Đầu khối: eyebrow + heading + intro. Không có gì thì không render. */
export function Head({
  section,
  light = false,
  intro = true,
}: {
  section?: PageSection | null;
  light?: boolean;
  /** false = bỏ đoạn intro (layout tự đặt content chỗ khác). */
  intro?: boolean;
}) {
  if (!section?.heading && !section?.subheading && !(intro && section?.content))
    return null;
  return (
    <div className="reveal mx-auto mb-[clamp(2.5rem,5vw,4rem)] max-w-[54rem] text-center">
      {section?.subheading ? (
        <Eyebrow gold={light} center heading show={showsEyebrow(section)}>
          {section.subheading}
        </Eyebrow>
      ) : null}
      {section?.heading ? (
        <h2 className={cn("text-h2", light && "text-light")}>
          {section.heading}
        </h2>
      ) : null}
      {intro ? (
        <RichIntro
          html={section?.content}
          className={cn(INTRO, "mx-auto", light && "text-light-soft")}
        />
      ) : null}
    </div>
  );
}

/** Khung section: nền thường / kem / xanh đậm; `flow` = nối liền khối kế tiếp cùng loại. */
export function Shell({
  id,
  tint,
  dark,
  flow,
  className,
  children,
}: {
  id: string;
  tint?: boolean;
  dark?: boolean;
  flow?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        SECTION,
        dark ? SECTION_DARK : tint && SECTION_TINT,
        flow && SECTION_FLOW,
        className,
      )}
      id={id}
    >
      <div className="site-container">{children}</div>
    </section>
  );
}

/** Nút CTA tuỳ chọn (ctaLabel/ctaHref trong metadata) — không có chữ thì không render. */
export function Cta({
  label,
  href,
  className,
  style,
}: {
  label: string | undefined;
  href: string | undefined;
  className: string;
  style?: CSSProperties;
}) {
  if (!label) return null;
  return (
    <a href={href || "#request-quote"} className={className} style={style}>
      {label}
    </a>
  );
}

/**
 * Giá trị thống kê: chữ số hiển thị lớn, ký tự ′ / + thu nhỏ; số ở đầu tự chạy
 * đếm khi cuộn tới (SiteEffects.tsx đọc thuộc tính `data-count`).
 */
function StatValue({ value, band }: { value: string; band?: boolean }) {
  const count = /^\d/.test(value) ? Number.parseInt(value, 10) : undefined;
  const parts = value.split(/([′+])/).filter(Boolean);
  return (
    <dd
      className={cn(
        // m-0 để dẹp margin-left mặc định của trình duyệt cho thẻ <dd>
        "m-0 mb-1 font-display text-h2 leading-none font-semibold",
        band ? "text-gold-500" : "text-gold-300",
      )}
      data-count={count}
    >
      {parts.map((part, index) =>
        part === "′" || part === "+" ? (
          <span className="text-[0.6em]" key={index}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </dd>
  );
}

/**
 * Dải số liệu (dùng trong hero và section `stats`). Mặc định là bản nằm trên nền
 * navy của hero; `band` = bản đứng trên nền sáng — đổi màu đường kẻ trên và màu
 * chữ cho đủ tương phản.
 *
 * Nhãn nằm DƯỚI con số dù trong DOM nó đứng trước (dt rồi mới dd) — đảo bằng
 * `order-2` chứ không đổi thứ tự thẻ, để trình đọc màn hình vẫn đọc "nhãn: giá trị".
 */
export function StatsList({
  stats,
  band,
  className,
}: {
  stats: Array<Record<string, string>>;
  band?: boolean;
  className?: string;
}) {
  const rows = stats.filter((stat) => stat.label && stat.value);
  if (rows.length === 0) return null;
  return (
    <dl
      className={cn(
        "mt-13 mb-0 flex flex-wrap gap-[clamp(1.5rem,4vw,3.5rem)] border-t pt-8 max-[640px]:justify-between max-[640px]:gap-6",
        band ? "border-t-line" : "border-t-light/20",
        className,
      )}
    >
      {rows.map((stat) => (
        <div className="flex flex-col" key={stat.label}>
          <dt
            className={cn(
              "order-2 text-xs tracking-xl uppercase",
              band ? "text-ink-faint" : "text-light-soft",
            )}
          >
            {stat.label}
          </dt>
          <StatValue value={stat.value} band={band} />
        </div>
      ))}
    </dl>
  );
}
