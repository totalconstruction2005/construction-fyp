const { sendEmail } = require("../../utils/email");
const validators = require("../../utils/validators");
const { AppError, asyncHandler } = require("../../middleware/errorHandler");

exports.submitMeetingRequest = asyncHandler(async (req, res) => {
  const { name, phone, email, queryType, message } = req.body;

  // Validate required fields
  const missingFields = validators.validateRequired(req.body, ["name", "phone", "email", "queryType"]);
  if (missingFields.length > 0) {
    throw new AppError(
      `Missing required fields: ${missingFields.join(", ")}`,
      400,
      "MISSING_REQUIRED_FIELDS"
    );
  }

  // Validate email format
  const trimmedEmail = email.trim().toLowerCase();
  if (!validators.validateEmail(trimmedEmail)) {
    throw new AppError("Invalid email format", 400, "INVALID_EMAIL_FORMAT");
  }

  // Get visitor IP
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";

  // Prepare submission time
  const submissionTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" }) + " (PKT)";

  // Create professional HTML email body
  const adminEmailBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f7f6;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          background-color: #ffffff;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          overflow: hidden;
        }
        .header {
          background-color: #064e3b; /* Emerald 900 */
          color: #ffffff;
          padding: 24px;
          text-align: center;
        }
        .header h2 {
          margin: 0;
          font-size: 20px;
          letter-spacing: 0.5px;
        }
        .content {
          padding: 30px;
          color: #334155;
          line-height: 1.6;
        }
        .section-title {
          font-weight: bold;
          font-size: 16px;
          color: #064e3b;
          border-bottom: 2px solid #10b981;
          padding-bottom: 6px;
          margin-bottom: 16px;
        }
        .info-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .info-table td {
          padding: 10px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .info-table td.label {
          font-weight: bold;
          color: #64748b;
          width: 30%;
          vertical-align: top;
        }
        .info-table td.value {
          color: #0f172a;
        }
        .message-box {
          background-color: #f8fafc;
          border-left: 4px solid #10b981;
          padding: 15px;
          border-radius: 4px;
          font-style: italic;
          margin-top: 10px;
          white-space: pre-line;
        }
        .footer {
          background-color: #f1f5f9;
          padding: 15px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Meeting Request Received</h2>
        </div>
        <div class="content">
          <div class="section-title">Customer Information</div>
          <table class="info-table">
            <tr>
              <td class="label">Name</td>
              <td class="value">${validators.sanitizeString(name)}</td>
            </tr>
            <tr>
              <td class="label">Phone</td>
              <td class="value">${validators.sanitizeString(phone)}</td>
            </tr>
            <tr>
              <td class="label">Email</td>
              <td class="value">${trimmedEmail}</td>
            </tr>
            <tr>
              <td class="label">Query Type</td>
              <td class="value"><strong>${validators.sanitizeString(queryType)}</strong></td>
            </tr>
            <tr>
              <td class="label">Time</td>
              <td class="value">${submissionTime}</td>
            </tr>
            <tr>
              <td class="label">IP Address</td>
              <td class="value">${ip}</td>
            </tr>
          </table>

          <div class="section-title">Message / Query</div>
          <div class="message-box">
            ${message ? validators.sanitizeString(message) : "No message provided."}
          </div>
        </div>
        <div class="footer">
          Sent automatically by Total Construction website contact system.
        </div>
      </div>
    </body>
    </html>
  `;

  // Admin email configuration - send to ADMIN_EMAIL or fallback to EMAIL_USER
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || "totalconstruction2005@gmail.com";

  await sendEmail(
    adminEmail,
    "New Meeting Request - Total Construction",
    adminEmailBody
  );

  return res.status(200).json({
    success: true,
    message: "Meeting request submitted and email sent to admin successfully.",
  });
});
