export const getOtpTemplate = (otp: string) => {
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

    <!-- HEADER -->
    <div style="
      background: linear-gradient(135deg, #111827, #374151);
      padding: 24px;
      text-align: center;
      color: #ffffff;
    ">
      <h2 style="margin:0; font-size: 20px; letter-spacing: 2px;">
        YOUR COMPANY
      </h2>
      <p style="margin:6px 0 0; font-size: 12px; opacity: 0.8;">
        Account Verification Code
      </p>
    </div>

    <!-- BODY -->
    <div style="padding: 28px; color: #111827;">

      <p style="font-size: 14px;">
        Hello,
      </p>

      <p style="font-size: 14px; line-height: 1.6; color: #374151;">
        We received a request to verify your account. Please use the OTP code below to complete your registration.
      </p>

      <!-- OTP BOX -->
      <div style="
        margin: 24px 0;
        padding: 18px;
        text-align: center;
        font-size: 28px;
        letter-spacing: 8px;
        font-weight: bold;
        background: #f3f4f6;
        border-radius: 10px;
        border: 1px dashed #9ca3af;
        color: #111827;
      ">
        ${otp}
      </div>

      <p style="font-size: 13px; color: #6b7280; text-align:center;">
        This code is valid for <b>10 minutes</b>. Do not share it with anyone.
      </p>

      <!-- SAFETY NOTE -->
      <div style="
        margin-top: 20px;
        font-size: 12px;
        color: #9ca3af;
        text-align: center;
      ">
        If you did not request this code, you can safely ignore this email.
      </div>

    </div>

    <!-- FOOTER -->
    <div style="
      background: #f9fafb;
      padding: 16px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    ">
      © ${new Date().getFullYear()} Your Company. All rights reserved.
    </div>

  </div>
  `;
};