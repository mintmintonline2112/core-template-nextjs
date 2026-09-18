export const getPasswordResetTemplate = (resetLink: string) => {
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
        YOUR COMPANY
      </h2>
      <p style="margin:6px 0 0; font-size: 12px; opacity: 0.8;">
        Password Reset Request
      </p>
    </div>

    <div style="padding: 28px; color: #111827;">
      <p style="font-size: 14px;">Hello,</p>

      <p style="font-size: 14px; line-height: 1.6; color: #374151;">
        We received a request to reset your account password.
        Click the button below to set a new password.
      </p>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${resetLink}" style="
          display: inline-block;
          padding: 14px 32px;
          background: linear-gradient(135deg, #111827, #374151);
          color: #ffffff;
          text-decoration: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 1px;
        ">RESET MY PASSWORD</a>
      </div>

      <p style="font-size: 13px; color: #6b7280; text-align: center;">
        This link is valid for <b>15 minutes</b>. Do not share it with anyone.
      </p>

      <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 16px;">
        If the button above does not work, copy and paste this link into your browser:<br>
        <span style="color: #374151; word-break: break-all;">${resetLink}</span>
      </p>

      <div style="margin-top: 20px; font-size: 12px; color: #9ca3af; text-align: center;">
        If you did not request a password reset, you can safely ignore this email.
      </div>
    </div>

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
