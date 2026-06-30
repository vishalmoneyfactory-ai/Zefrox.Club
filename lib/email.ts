import nodemailer from 'nodemailer';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Zerofx.club';

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

function emailWrapper(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Inter',Arial,sans-serif;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f1f5f9;padding:40px 20px;">
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
              <tr>
                <td style="background:linear-gradient(135deg,#1e40af 0%,#3b82f6 100%);padding:32px 40px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">${APP_NAME}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:40px;">
                  ${content}
                </td>
              </tr>
              <tr>
                <td style="padding:24px 40px;background-color:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
                  <p style="margin:0;color:#94a3b8;font-size:13px;">
                    © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                  </p>
                  <p style="margin:8px 0 0;color:#94a3b8;font-size:12px;">
                    This is an automated email. Please do not reply.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export async function sendOtpEmail(email: string, otp: string, name: string): Promise<void> {
  const content = `
    <h2 style="margin:0 0 16px;color:#0f172a;font-size:20px;font-weight:600;">
      Hello ${name},
    </h2>
    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
      Your one-time verification code is:
    </p>
    <div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border:2px solid #bfdbfe;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
      <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#1e40af;">${otp}</span>
    </div>
    <p style="margin:0 0 8px;color:#475569;font-size:14px;">
      This code expires in <strong>10 minutes</strong>.
    </p>
    <p style="margin:0;color:#94a3b8;font-size:13px;">
      If you didn't request this code, please ignore this email.
    </p>
  `;

  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.ADMIN_EMAIL}>`,
    to: email,
    subject: `${APP_NAME} — Your Verification Code`,
    html: emailWrapper(content),
  });
}

export async function sendKycApprovedEmail(email: string, name: string): Promise<void> {
  const content = `
    <h2 style="margin:0 0 16px;color:#0f172a;font-size:20px;font-weight:600;">
      Congratulations, ${name}! 🎉
    </h2>
    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
      Your KYC verification has been <strong>approved</strong>.
    </p>
    <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:12px;padding:20px;margin:0 0 24px;">
      <p style="margin:0;color:#166534;font-size:15px;font-weight:500;">
        ✅ Your identity has been verified successfully. All payment features are now unlocked for your account.
      </p>
    </div>
    <p style="margin:0;color:#475569;font-size:14px;">
      You can now upload payment proofs and track your transactions from your dashboard.
    </p>
  `;

  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.ADMIN_EMAIL}>`,
    to: email,
    subject: `${APP_NAME} — KYC Approved`,
    html: emailWrapper(content),
  });
}

export async function sendKycRejectedEmail(email: string, name: string, reason: string): Promise<void> {
  const content = `
    <h2 style="margin:0 0 16px;color:#0f172a;font-size:20px;font-weight:600;">
      Hello ${name},
    </h2>
    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
      Unfortunately, your KYC verification has been <strong>rejected</strong>.
    </p>
    <div style="background:#fef2f2;border:2px solid #fca5a5;border-radius:12px;padding:20px;margin:0 0 24px;">
      <p style="margin:0 0 8px;color:#991b1b;font-size:13px;font-weight:600;text-transform:uppercase;">
        Reason for Rejection
      </p>
      <p style="margin:0;color:#dc2626;font-size:15px;">
        ${reason}
      </p>
    </div>
    <p style="margin:0;color:#475569;font-size:14px;">
      Please review the feedback above and resubmit your KYC with the correct information from your dashboard.
    </p>
  `;

  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.ADMIN_EMAIL}>`,
    to: email,
    subject: `${APP_NAME} — KYC Requires Resubmission`,
    html: emailWrapper(content),
  });
}

export async function sendPaymentApprovedEmail(
  email: string,
  name: string,
  amount: number,
  transactionId: string
): Promise<void> {
  const content = `
    <h2 style="margin:0 0 16px;color:#0f172a;font-size:20px;font-weight:600;">
      Payment Confirmed, ${name}! ✅
    </h2>
    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
      Your payment has been verified and approved.
    </p>
    <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:12px;padding:20px;margin:0 0 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding:8px 0;color:#475569;font-size:14px;">Amount Paid</td>
          <td style="padding:8px 0;color:#166534;font-size:18px;font-weight:700;text-align:right;">₹${amount.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-top:1px solid #dcfce7;color:#475569;font-size:14px;">Transaction ID</td>
          <td style="padding:8px 0;border-top:1px solid #dcfce7;color:#166534;font-size:14px;font-weight:500;text-align:right;">${transactionId}</td>
        </tr>
      </table>
    </div>
    <p style="margin:0;color:#475569;font-size:14px;">
      You can view the full details in your payment history on the dashboard.
    </p>
  `;

  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.ADMIN_EMAIL}>`,
    to: email,
    subject: `${APP_NAME} — Payment Approved (₹${amount.toLocaleString('en-IN')})`,
    html: emailWrapper(content),
  });
}

export async function sendPaymentRejectedEmail(
  email: string,
  name: string,
  amount: number,
  reason: string
): Promise<void> {
  const content = `
    <h2 style="margin:0 0 16px;color:#0f172a;font-size:20px;font-weight:600;">
      Hello ${name},
    </h2>
    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
      Your payment of <strong>₹${amount.toLocaleString('en-IN')}</strong> has been <strong>rejected</strong>.
    </p>
    <div style="background:#fef2f2;border:2px solid #fca5a5;border-radius:12px;padding:20px;margin:0 0 24px;">
      <p style="margin:0 0 8px;color:#991b1b;font-size:13px;font-weight:600;text-transform:uppercase;">
        Reason for Rejection
      </p>
      <p style="margin:0;color:#dc2626;font-size:15px;">
        ${reason}
      </p>
    </div>
    <p style="margin:0;color:#475569;font-size:14px;">
      Please check the reason above and re-upload the correct payment proof from your dashboard.
    </p>
  `;

  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.ADMIN_EMAIL}>`,
    to: email,
    subject: `${APP_NAME} — Payment Rejected`,
    html: emailWrapper(content),
  });
}

