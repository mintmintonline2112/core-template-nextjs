/**
 * Danh mục cho các ô chọn trong FORM BÁO GIÁ (forms.tsx).
 * Nội dung hiển thị trên trang nằm trong CMS / seed (backend page.seed.ts),
 * không đọc từ đây.
 *
 * KHI TẠO SITE MỚI: thay bằng danh mục thật của khách. Tên hằng giữ nguyên để
 * khỏi phải sửa forms.tsx.
 */

/** Ô chọn thứ hai của form — quy mô, cỡ, gói… tuỳ ngành. */
export const SIZE_OPTIONS = [
  "Nhỏ",
  "Vừa",
  "Lớn",
  "Theo yêu cầu riêng",
] as const;

/** Nhóm sản phẩm / dịch vụ chính (form báo giá có thêm lựa chọn "Khác"). */
export const PRODUCT_OPTIONS = [
  "Nhóm sản phẩm 1",
  "Nhóm sản phẩm 2",
  "Nhóm sản phẩm 3",
  "Nhóm sản phẩm 4",
] as const;
