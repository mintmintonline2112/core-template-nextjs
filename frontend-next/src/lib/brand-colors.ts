/**
 * 4 MÀU THƯƠNG HIỆU — chỉnh ở Admin → Cài đặt → Màu thương hiệu.
 *
 * styles/base.css khai báo --brand-primary / --brand-secondary / --brand-black /
 * --brand-white (mặc định bên dưới) và TỰ SUY RA mọi sắc độ (navy-900…50,
 * gold-500…100, chữ, nền) bằng color-mix. Layout (site) chèn CSS từ
 * brandColorsCss() để đè 4 biến gốc → cả site đổi màu theo.
 *
 * File không import gì để dùng được ở cả website (server) lẫn admin (client).
 */

export type BrandColorKey = "primary" | "secondary" | "black" | "white";
export type BrandColors = Partial<Record<BrandColorKey, string>>;

export const BRAND_COLOR_FIELDS: Array<{
  key: BrandColorKey;
  label: string;
  hint: string;
  defaultValue: string;
}> = [
  {
    key: "primary",
    label: "Màu chủ đạo",
    hint: "Thanh trên cùng, dải nền tối (hero, bản đồ, form báo giá, footer), tiêu đề",
    defaultValue: "#004C69",
  },
  {
    key: "secondary",
    label: "Màu phụ (vàng)",
    hint: "Nút chính, điểm nhấn, số liệu, gạch trang trí",
    defaultValue: "#C9A35E",
  },
  {
    key: "black",
    label: "Màu đen (chữ)",
    hint: "Chữ nội dung; chữ phụ và chữ mờ là sắc nhạt hơn của màu này",
    defaultValue: "#231F20",
  },
  {
    key: "white",
    label: "Màu trắng",
    hint: "Nền thẻ, chữ trên nền tối",
    defaultValue: "#FFFFFF",
  },
];

export const BRAND_COLOR_DEFAULTS = Object.fromEntries(
  BRAND_COLOR_FIELDS.map((field) => [field.key, field.defaultValue]),
) as Record<BrandColorKey, string>;

/**
 * Sắc độ suy ra từ 4 màu gốc — PHẢI KHỚP công thức trong styles/base.css
 * (dùng cho ô xem trước ở admin).
 */
export const BRAND_SHADES: Array<{ label: string; css: string }> = [
  { label: "Chủ đạo 900", css: "color-mix(in oklab, var(--brand-primary) 58%, #000)" },
  { label: "Chủ đạo 800", css: "color-mix(in oklab, var(--brand-primary) 78%, #000)" },
  { label: "Chủ đạo 700", css: "var(--brand-primary)" },
  { label: "Chủ đạo 600", css: "color-mix(in oklab, var(--brand-primary) 80%, #fff)" },
  { label: "Chủ đạo 100", css: "color-mix(in oklab, var(--brand-primary) 14%, #fff)" },
  { label: "Vàng 500", css: "color-mix(in oklab, var(--brand-secondary) 72%, #000)" },
  { label: "Vàng 400", css: "var(--brand-secondary)" },
  { label: "Vàng 300", css: "color-mix(in oklab, var(--brand-secondary) 82%, #fff)" },
  { label: "Vàng 100", css: "color-mix(in oklab, var(--brand-secondary) 22%, #fff)" },
  { label: "Chữ", css: "var(--brand-black)" },
  { label: "Chữ phụ", css: "color-mix(in oklab, var(--brand-black) 78%, #fff)" },
  { label: "Chữ mờ", css: "color-mix(in oklab, var(--brand-black) 62%, #fff)" },
];

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/** Màu hợp lệ (#RRGGBB) mà admin đã chọn — bỏ qua giá trị rác. */
export function isBrandHex(value: unknown): value is string {
  return typeof value === "string" && HEX_RE.test(value);
}

/** CSS đè 4 biến gốc theo cài đặt; chuỗi rỗng nếu admin chưa đổi màu nào. */
export function brandColorsCss(colors: BrandColors | null | undefined): string {
  const declarations = BRAND_COLOR_FIELDS.filter((field) =>
    isBrandHex(colors?.[field.key]),
  ).map((field) => `--brand-${field.key}: ${colors![field.key]};`);
  return declarations.length > 0 ? `:root { ${declarations.join(" ")} }` : "";
}
