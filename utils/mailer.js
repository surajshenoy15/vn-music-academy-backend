import SibApiV3Sdk from "@sendinblue/client";

const formatDate = (dateValue) => {
  if (!dateValue) return "Not specified";

  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

export const sendMilestoneMail = async (
  to,
  name,
  sessionCount,
  renewalDate
) => {
  const client = new SibApiV3Sdk.TransactionalEmailsApi();

  client.setApiKey(
    SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
    process.env.SENDINBLUE_API_KEY
  );

  const formattedRenewalDate = formatDate(renewalDate);
  const websiteUrl = "https://www.vnmusicacademy.com/";

  const sendSmtpEmail = {
    sender: {
      name: "VN Music Academy",
      email: process.env.EMAIL_FROM_ADDRESS,
    },

    to: [{ email: to, name }],

    subject: `🎉 ${sessionCount} Sessions Completed - Renewal Reminder`,

    htmlContent: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </head>

        <body
          style="
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            font-family: Arial, Helvetica, sans-serif;
          "
        >
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            role="presentation"
          >
            <tr>
              <td align="center">
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  style="
                    max-width: 600px;
                    background-color: #ffffff;
                    border-radius: 14px;
                    overflow: hidden;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
                  "
                >
                  <!-- Header -->
                  <tr>
                    <td
                      align="center"
                      style="
                        background-color: #4a4947;
                        padding: 32px 24px;
                      "
                    >
                      <h1
                        style="
                          margin: 0;
                          color: #ffffff;
                          font-size: 27px;
                          font-weight: 700;
                        "
                      >
                        VN Music Academy
                      </h1>

                      <p
                        style="
                          margin: 8px 0 0;
                          color: #e7e7e7;
                          font-size: 14px;
                        "
                      >
                        Learn. Practice. Grow.
                      </p>
                    </td>
                  </tr>

                  <!-- Main content -->
                  <tr>
                    <td style="padding: 38px 35px">
                      <p
                        style="
                          margin: 0 0 24px;
                          color: #333333;
                          font-size: 17px;
                        "
                      >
                        Dear <strong>${name}</strong>,
                      </p>

                      <!-- Session milestone -->
                      <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        role="presentation"
                        style="
                          border: 2px solid #4a4947;
                          border-radius: 12px;
                          background-color: #fafafa;
                        "
                      >
                        <tr>
                          <td
                            align="center"
                            style="padding: 30px 20px"
                          >
                            <div
                              style="
                                font-size: 45px;
                                margin-bottom: 12px;
                              "
                            >
                              🎉
                            </div>

                            <div
                              style="
                                color: #4a4947;
                                font-size: 60px;
                                font-weight: 800;
                                line-height: 1;
                              "
                            >
                              ${sessionCount}
                            </div>

                            <div
                              style="
                                margin-top: 12px;
                                color: #4a4947;
                                font-size: 16px;
                                font-weight: 700;
                                letter-spacing: 1px;
                                text-transform: uppercase;
                              "
                            >
                              Sessions Completed
                            </div>
                          </td>
                        </tr>
                      </table>

                      <p
                        style="
                          margin: 25px 0;
                          color: #666666;
                          font-size: 16px;
                          line-height: 1.7;
                          text-align: center;
                        "
                      >
                        Congratulations on completing
                        <strong>${sessionCount} sessions</strong>.
                        Your dedication and progress in your musical
                        journey are truly appreciated.
                      </p>

                      <!-- Renewal date -->
                      <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        role="presentation"
                        style="
                          background-color: #fff8e8;
                          border: 1px solid #f1cf76;
                          border-radius: 10px;
                        "
                      >
                        <tr>
                          <td
                            align="center"
                            style="padding: 20px"
                          >
                            <div
                              style="
                                color: #7a5411;
                                font-size: 13px;
                                font-weight: 700;
                                letter-spacing: 0.8px;
                                text-transform: uppercase;
                              "
                            >
                              Session Renewal Date
                            </div>

                            <div
                              style="
                                margin-top: 8px;
                                color: #4a4947;
                                font-size: 21px;
                                font-weight: 700;
                              "
                            >
                              ${formattedRenewalDate}
                            </div>

                            <p
                              style="
                                margin: 10px 0 0;
                                color: #785f32;
                                font-size: 14px;
                                line-height: 1.5;
                              "
                            >
                              Please renew before this date to continue
                              your classes without interruption.
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- Website button -->
                      <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        role="presentation"
                      >
                        <tr>
                          <td
                            align="center"
                            style="padding-top: 30px"
                          >
                            <a
                              href="${websiteUrl}"
                              target="_blank"
                              style="
                                display: inline-block;
                                background-color: #4a4947;
                                color: #ffffff;
                                padding: 14px 28px;
                                border-radius: 8px;
                                font-size: 15px;
                                font-weight: 700;
                                text-decoration: none;
                              "
                            >
                              Visit VN Music Academy
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p
                        style="
                          margin: 20px 0 0;
                          color: #999999;
                          font-size: 12px;
                          text-align: center;
                        "
                      >
                        You can also visit:
                        <a
                          href="${websiteUrl}"
                          style="color: #4a4947"
                        >
                          www.vnmusicacademy.com
                        </a>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td
                      align="center"
                      style="
                        background-color: #4a4947;
                        padding: 24px;
                      "
                    >
                      <p
                        style="
                          margin: 0;
                          color: #ffffff;
                          font-size: 15px;
                          font-weight: 600;
                        "
                      >
                        VN Music Academy
                      </p>

                      <p
                        style="
                          margin: 8px 0 0;
                          color: #d6d6d6;
                          font-size: 12px;
                        "
                      >
                        Thank you for being part of our musical community.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,

    textContent: `
Dear ${name},

Congratulations! You have completed ${sessionCount} sessions with VN Music Academy.

Your session renewal date is ${formattedRenewalDate}.

Please renew before this date to continue your classes without interruption.

Visit VN Music Academy:
${websiteUrl}

Regards,
VN Music Academy
    `.trim(),
  };

  try {
    const result = await client.sendTransacEmail(sendSmtpEmail);

    console.log(
      `📩 Milestone email sent to ${to} for ${sessionCount} sessions:`,
      result
    );

    return result;
  } catch (error) {
    console.error(
      "❌ Failed to send milestone email via Sendinblue:",
      error?.response?.body || error
    );

    throw error;
  }
};