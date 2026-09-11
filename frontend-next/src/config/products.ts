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
  "18/20",
  "20/22",
  "23/25",
  "25/27",
  "27/30",
  "30/32",
  "32/34",
] as const;

/** Giống hạt tự nhiên của California. */
export const ALMOND_VARIETIES = [
  "Nonpareil",
  "Independence",
  "Monterey",
  "Carmel",
  "Butte",
  "Padre",
  "California Varieties",
] as const;

/** Định dạng đã qua chế biến. */
export const PROCESSED_FORMATS = [
  "Blanched",
  "Sliced",
  "Slivered",
  "Diced",
  "Almond Flour & Meal",
] as const;
