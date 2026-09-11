/**
 * Giá trị cột `module` của bảng notifications.
 *
 * PHẢI trùng với tên controller viết thường, bỏ hậu tố `Controller` — vì
 * permission.seed.ts sinh `permission.module` theo đúng quy tắc đó, còn
 * notification.service.ts lại lọc thông báo theo danh sách module mà nhân viên
 * có quyền. Lệch một ký tự là thông báo biến mất khỏi chuông, không báo lỗi gì.
 *
 * Đổi tên controller → sửa luôn ở đây.
 */
export const NOTIFICATION_MODULE = {
  /** AdminContactController */
  contact: 'admincontact',
  /** AdminQuoteRequestsController */
  quoteRequest: 'adminquoterequests',
} as const;
