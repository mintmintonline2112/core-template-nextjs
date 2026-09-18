/**
 * Thông tin liên hệ MẶC ĐỊNH của website — dùng khi Admin → Trang Liên hệ
 * → Thông tin công ty để trống ô tương ứng (xem resolveContact trong lib/settings.ts).
 *
 * KHI TẠO SITE MỚI: thay bằng thông tin thật của khách, hoặc nhập trong dashboard.
 */
export const SITE_CONTACT = {
  location: "Việt Nam",
  address: "Số nhà, đường, phường, quận, thành phố",
  email: "hello@example.com",
  phone: "0900 000 000",
  phoneHref: "tel:0900000000",
  hours: "8:00 - 17:30 (Thứ 2 - Thứ 7)",
} as const;
