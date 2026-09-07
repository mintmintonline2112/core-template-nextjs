export const getOrderConfirmationTemplate = (order: {
  order_code: string;
  receiver_name?: string;
  shipping_address: string;
  delivery_price: number;
  total_amount: number;
  order_items?: { quantity: number; price: number; product?: { name?: string } }[];
  payment_method?: { name?: string };
  delivery_method?: { name?: string };
}) => {
  const itemRows =
    order.order_items
      ?.map(
        (item) => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;font-size:13px;">
        ${item.product?.name || 'Sản phẩm'}
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;text-align:center;font-size:13px;">
        ${item.quantity}
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;text-align:right;font-size:13px;">
        ₫${(Number(item.price) * item.quantity).toLocaleString('vi-VN')}
      </td>
    </tr>
  `,
      )
      .join('') || '';

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">

    <div style="background:linear-gradient(135deg,#111827,#374151);padding:24px;text-align:center;color:#fff;">
      <h2 style="margin:0;font-size:20px;letter-spacing:2px;">PRIME NUTS USA — CALIFORNIA ALMONDS</h2>
      <p style="margin:6px 0 0;font-size:12px;opacity:0.8;">Xác nhận đặt hàng thành công</p>
    </div>

    <div style="padding:28px;color:#111827;">
      <p style="font-size:14px;">
        Xin chào <strong>${order.receiver_name || 'Quý khách'}</strong>,
      </p>
      <p style="font-size:14px;color:#374151;line-height:1.6;">
        Đơn hàng của bạn đã được đặt thành công. Chúng tôi sẽ sớm liên hệ để xác nhận và giao hàng.
      </p>

      <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:20px 0;text-align:center;">
        <p style="margin:0 0 6px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Mã đơn hàng</p>
        <p style="margin:0;font-size:22px;font-weight:bold;letter-spacing:4px;color:#111827;">${order.order_code}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:10px 8px;text-align:left;font-size:12px;color:#374151;font-weight:600;">Sản phẩm</th>
            <th style="padding:10px 8px;text-align:center;font-size:12px;color:#374151;font-weight:600;">SL</th>
            <th style="padding:10px 8px;text-align:right;font-size:12px;color:#374151;font-weight:600;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div style="border-top:1px solid #e5e7eb;padding-top:12px;">
        <p style="font-size:13px;color:#6b7280;margin:6px 0;display:flex;justify-content:space-between;">
          <span>Phí vận chuyển</span>
          <span>₫${Number(order.delivery_price).toLocaleString('vi-VN')}</span>
        </p>
        <p style="font-size:16px;font-weight:bold;margin:10px 0 0;display:flex;justify-content:space-between;border-top:2px solid #111827;padding-top:10px;">
          <span>TỔNG THANH TOÁN</span>
          <span>₫${Number(order.total_amount).toLocaleString('vi-VN')}</span>
        </p>
      </div>

      <div style="margin-top:24px;padding:16px;background:#f9fafb;border-radius:8px;font-size:13px;color:#374151;">
        <p style="margin:0 0 8px;"><strong>Địa chỉ giao hàng:</strong> ${order.shipping_address}</p>
        <p style="margin:0 0 8px;"><strong>Phương thức thanh toán:</strong> ${order.payment_method?.name || ''}</p>
        <p style="margin:0;"><strong>Phương thức vận chuyển:</strong> ${order.delivery_method?.name || ''}</p>
      </div>
    </div>

    <div style="background:#f9fafb;padding:16px;text-align:center;font-size:12px;color:#6b7280;">
      © ${new Date().getFullYear()} Prime Nuts USA. All rights reserved.
    </div>

  </div>
  `;
};
