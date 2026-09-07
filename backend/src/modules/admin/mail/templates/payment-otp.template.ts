export const getPaymentOtpTemplate = (otp: string) => {
  return `
  <div style="
    font-family: Arial, Helvetica, sans-serif;
    max-width: 520px;
    margin: auto;
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
  ">

    <div style="
      background: linear-gradient(135deg, #111827, #374151);
      padding: 24px;
      text-align: center;
      color: #ffffff;
    ">
      <h2 style="margin:0; font-size: 20px; letter-spacing: 2px;">
        PRIME NUTS USA — CALIFORNIA ALMONDS
      </h2>
      <p style="margin:6px 0 0; font-size: 12px; opacity: 0.8;">
        Xác nhận thanh toán trực tuyến
      </p>
    </div>

    <div style="padding: 28px; color: #111827;">

      <p style="font-size: 14px;">Xin chào,</p>

      <p style="font-size: 14px; line-height: 1.6; color: #374151;">
        Chúng tôi nhận được yêu cầu thanh toán trực tuyến từ tài khoản của bạn.
        Vui lòng sử dụng mã OTP bên dưới để xác nhận giao dịch.
      </p>

      <div style="
        margin: 24px 0;
        padding: 18px;
        text-align: center;
        font-size: 32px;
        letter-spacing: 10px;
        font-weight: bold;
        background: #f3f4f6;
        border-radius: 10px;
        border: 1px dashed #9ca3af;
        color: #111827;
      ">
        ${otp}
      </div>

      <p style="font-size: 13px; color: #6b7280; text-align:center;">
        Mã có hiệu lực trong <b>5 phút</b>. Không chia sẻ mã này với bất kỳ ai.
      </p>

      <div style="
        margin-top: 20px;
        padding: 12px 16px;
        background: #fff3cd;
        border-radius: 8px;
        font-size: 13px;
        color: #856404;
      ">
        <strong>Lưu ý:</strong> Nếu bạn không thực hiện giao dịch này, vui lòng bỏ qua email này và kiểm tra lại tài khoản.
      </div>

    </div>

    <div style="
      background: #f9fafb;
      padding: 16px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    ">
      © ${new Date().getFullYear()} Prime Nuts USA. All rights reserved.
    </div>

  </div>
  `;
};
