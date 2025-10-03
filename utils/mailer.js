import SibApiV3Sdk from "@sendinblue/client";

export const sendMilestoneMail = async (to, name, sessionCount) => {
  const client = new SibApiV3Sdk.TransactionalEmailsApi();
  client.setApiKey(
    SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
    process.env.SENDINBLUE_API_KEY
  );

  const sendSmtpEmail = {
    sender: { name: "VN Music Academy", email: process.env.EMAIL_FROM_ADDRESS },
    to: [{ email: to, name }],
    subject: `🎉 Congratulations ${name}!`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background-color: #fafafa;
              padding: 20px;
            }
            .email-wrapper {
              max-width: 600px;
              margin: 0 auto;
              background-color: #fafafa;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
            }
            .header-section {
              background: linear-gradient(135deg, #4A4947 0%, #3a3836 100%);
              padding: 35px 40px;
              text-align: center;
            }
            .logo-text {
              color: #ffffff;
              font-size: 28px;
              font-weight: 700;
              letter-spacing: -0.5px;
            }
            .main-content {
              padding: 40px;
            }
            .greeting-text {
              font-size: 17px;
              color: #333333;
              margin-bottom: 30px;
            }
            .achievement-card {
              background: linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%);
              border: 2px solid #4A4947;
              border-radius: 12px;
              padding: 35px;
              text-align: center;
              margin: 25px 0;
            }
            .celebration-emoji {
              font-size: 48px;
              margin-bottom: 15px;
            }
            .session-number {
              font-size: 64px;
              font-weight: 800;
              color: #4A4947;
              line-height: 1;
              margin: 10px 0;
            }
            .session-label {
              font-size: 18px;
              color: #4A4947;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .message-text {
              font-size: 16px;
              color: #666666;
              line-height: 1.7;
              text-align: center;
              margin-top: 25px;
            }
            .footer-section {
              background-color: #4A4947;
              padding: 25px 40px;
              text-align: center;
            }
            .footer-brand {
              font-size: 16px;
              color: #ffffff;
              font-weight: 600;
            }
            @media only screen and (max-width: 600px) {
              body {
                padding: 10px;
              }
              .header-section {
                padding: 25px 20px;
              }
              .main-content {
                padding: 30px 20px;
              }
              .achievement-card {
                padding: 25px 15px;
              }
              .session-number {
                font-size: 52px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header-section">
              <h1 class="logo-text">VN Music Academy</h1>
            </div>
            
            <div class="main-content">
              <div class="greeting-text">
                Dear <strong>${name}</strong>,
              </div>
              
              <div class="achievement-card">
                <div class="celebration-emoji">🎉</div>
                <div class="session-number">${sessionCount}</div>
                <div class="session-label">Sessions Completed</div>
              </div>
              
              <div class="message-text">
                Congratulations on reaching this milestone! Your dedication to your musical journey is inspiring. Keep up the excellent work.
              </div>
            </div>
            
            <div class="footer-section">
              <div class="footer-brand">VN Music Academy</div>
            </div>
          </div>
        </body>
      </html>
    `,
    textContent: `Hi ${name},\n\nYou've completed ${sessionCount} sessions with VN Music Academy!\n\nCongratulations on reaching this milestone! Keep up the excellent work.\n\n- VN Music Academy`,
  };

  try {
    const result = await client.sendTransacEmail(sendSmtpEmail);
    console.log(`📩 Milestone Email sent to ${to}:`, result);
  } catch (error) {
    console.error("❌ Failed to send milestone email via Sendinblue:", error);
  }
};