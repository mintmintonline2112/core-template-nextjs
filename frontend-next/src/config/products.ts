/**
 * Danh mục sản phẩm dùng chung — nguồn DUY NHẤT cho trang chủ, trang Sản phẩm
 * và các ô chọn trong form báo giá. Trước đây mỗi nơi khai báo một bản nên đã
 * lệch nhau (form có "Independence" còn trang chủ thì không).
 *
 * Đây chỉ là giá trị MẶC ĐỊNH: admin nhập `varieties` / `sizes` trong
 * page-section thì dữ liệu CMS được ưu tiên.
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
