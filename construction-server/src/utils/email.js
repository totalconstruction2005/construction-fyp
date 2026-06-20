const nodemailer = require("nodemailer");

/**
 * Create Nodemailer transporter
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "465"),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Verify transporter configuration on startup (optional)
 */
transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter error:", error);
  } else if (success) {
    console.log("Email transporter ready");
  }
});

/**
 * Send email function
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML email body
 * @returns {Promise<object>} - Result object with messageId
 */
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || "Total Construction <no-reply@totalconstruction.com>",
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Email send error to ${to}:`, error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Generate password reset email template
 * @param {string} resetCode - 6-digit reset code
 * @param {number} expiryMinutes - Minutes until code expires
 * @returns {string} - HTML email template
 */
const getPasswordResetEmailTemplate = (resetCode, expiryMinutes = 15) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f5f5;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
        }
        .content {
          padding: 30px;
        }
        .greeting {
          font-size: 16px;
          margin-bottom: 20px;
          line-height: 1.6;
        }
        .code-section {
          background-color: #f0fdf4;
          border: 2px solid #10b981;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
          text-align: center;
        }
        .code {
          font-size: 32px;
          font-weight: bold;
          color: #10b981;
          letter-spacing: 4px;
          margin: 0;
          font-family: 'Courier New', monospace;
        }
        .code-label {
          font-size: 12px;
          color: #666;
          margin-top: 8px;
          text-transform: uppercase;
        }
        .expiry-notice {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          font-size: 13px;
        }
        .expiry-notice strong {
          color: #f59e0b;
        }
        .warning {
          background-color: #fee2e2;
          border-left: 4px solid #ef4444;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          font-size: 13px;
        }
        .warning strong {
          color: #ef4444;
        }
        .footer {
          font-size: 12px;
          color: #999;
          text-align: center;
          padding: 20px;
          border-top: 1px solid #eee;
        }
        .footer a {
          color: #10b981;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Reset Your Password</h1>
        </div>
        <div class="content">
          <p class="greeting">Hello,</p>
          
          <p>We received a request to reset your password. Use the code below to complete the reset process:</p>
          
          <div class="code-section">
            <div class="code">${resetCode}</div>
            <div class="code-label">Password Reset Code</div>
          </div>
          
          <div class="expiry-notice">
            <strong>⏱️ Important:</strong> This code expires in <strong>${expiryMinutes} minutes</strong>. After that, you'll need to request a new code.
          </div>
          
          <p style="margin-bottom: 10px;">To reset your password:</p>
          <ol style="margin-top: 10px; padding-left: 20px;">
            <li>Go to the password reset page</li>
            <li>Enter the code: <strong>${resetCode}</strong></li>
            <li>Enter your new password</li>
            <li>Click "Reset Password"</li>
          </ol>
          
          <div class="warning">
            <strong>⚠️ Security Note:</strong> If you did not request this password reset, please ignore this email. Your account remains secure.
          </div>
          
          <p style="color: #666; font-size: 13px; margin-top: 20px;">
            This is an automated email from Total Construction. Please do not reply to this email.
          </p>
        </div>
        <div class="footer">
          <p>Total Construction Password Reset Service</p>
          <p>&copy; ${new Date().getFullYear()} Total Construction. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  sendEmail,
  transporter,
  getPasswordResetEmailTemplate,
};
