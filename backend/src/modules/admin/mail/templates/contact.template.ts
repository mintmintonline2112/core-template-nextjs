export const contactTemplate = (data: any) => `
<div style="
  background-color: #fff0f3; 
  padding: 50px 20px; 
  font-family: 'Georgia', serif;
">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        
        <table width="1000" cellpadding="0" cellspacing="0" style="
          background-color: #ffffff; 
          border-radius: 30px; 
          overflow: hidden; 
          box-shadow: 0 15px 45px rgba(216, 138, 154, 0.2);
          border: 1px solid #ffe4e8;
        ">
          
          <tr>
            <td align="center" style="background-color: #ffeef1; padding: 40px 20px;">
              <div style="font-size: 45px; margin-bottom: 10px;">💌</div>
              <h1 style="
                margin: 0; 
                color: #d88a9a; 
                font-size: 24px; 
                letter-spacing: 3px;
                text-transform: uppercase;
                font-weight: normal;
              ">
                YOUR COMPANY — NEW MESSAGE
              </h1>
              <p style="margin: 5px 0 0; color: #ba949b; font-size: 12px; font-style: italic; letter-spacing: 1px;">
                You have received a sweet note from a customer
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="
                background-color: #fffdf9; 
                border: 1px solid #f9ebed; 
                padding: 35px; 
                border-radius: 15px;
                background-image: radial-gradient(#f1e6d8 0.5px, transparent 0.5px);
                background-size: 25px 25px;
              ">
                <tr>
                  <td>
                    <p style="
                      font-family: 'Brush Script MT', cursive; 
                      font-size: 28px; 
                      color: #c06c7a; 
                      margin: 0 0 25px 0;
                    ">
                      Dear Team,
                    </p>

                    <div style="
                      font-size: 17px; 
                      line-height: 1.9; 
                      color: #5a5555; 
                      font-style: italic;
                      min-height: 180px;
                    ">
                      ${data.message.replace(/\n/g, '<br/>')}
                    </div>

                    <div style="text-align: right; margin-top: 40px;">
                      <p style="margin: 0; color: #ba949b; font-size: 14px;">Sent with love by,</p>
                      <p style="
                        margin: 5px 0 0;
                        font-family: 'Brush Script MT', cursive; 
                        font-size: 40px; 
                        color: #d88a9a;
                        text-shadow: 1px 1px 3px rgba(216, 138, 154, 0.3);
                      ">
                        ${data.fullname}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <div style="
                background-color: #fff9fa; 
                padding: 20px; 
                border-radius: 12px; 
                font-size: 13px; 
                color: #8c7e7e;
                border: 1px dashed #ffd1d9;
                line-height: 1.6;
              ">
                <span style="display: block; margin-bottom: 8px; font-weight: bold; color: #d88a9a;">🌸 DON'T FORGET TO REPLY:</span>
                📧 <b>Email:</b> ${data.email} <br>
                📞 <b>Phone:</b> ${data.phone} <br>
                ✨ <b>Subject:</b> ${data.subject || 'Inquiry from the website'}
              </div>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <div style="color: #d88a9a; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">
                YOUR COMPANY
              </div>
              <div style="margin-top: 8px; color: #c5beb5; font-size: 10px;">
                Automated message generated at: ${new Date().toLocaleString('en-US')}
              </div>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</div>
`;