/**
 * Danh mục sản phẩm cho các ô chọn trong FORM BÁO GIÁ (forms.tsx).
 * Nội dung hiển thị trên trang (giống, cỡ hạt…) nằm trong CMS / seed
 * (backend page.seed.ts), không đọc từ đây.
 */

/** Cỡ hạt tính theo số nhân trên mỗi ounce. */
export const KERNEL_SIZES = [
  "20/22",
  "22/24",
  "23/25",
  "25/27",
  "27/30",
  "30/32",
] as const;

/** Giống hạt chào bán chính (form báo giá có thêm lựa chọn "Other / Custom"). */
export const ALMOND_VARIETIES = [
  "Nonpareil",
  "Independence",
  "Carmel-Type",
  "California-Type",
] as const;

/** Định dạng đã qua chế biến. */
export const PROCESSED_FORMATS = [
  "Blanched",
  "Sliced",
  "Slivered",
  "Diced",
  "Almond Flour & Meal",
] as const;
