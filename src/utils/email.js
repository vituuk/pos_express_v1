const nodemailer = require("nodemailer");

/**
 * Sends a receipt email to the configured email address when a transaction succeeds.
 * @param {object} order - The Sequelize Order object.
 * @param {object} payment - The Sequelize Payment object.
 */
async function sendEmailOrderAlert(order, payment) {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER || process.env.ABA_PAYWAY_MERCHANT_EMAIL;
  const pass = process.env.SMTP_PASS;
  const toEmail = process.env.NOTIFICATION_EMAIL || process.env.ABA_PAYWAY_MERCHANT_EMAIL || user;

  if (!user || !pass) {
    console.warn("Email alert skipped: SMTP_USER or SMTP_PASS is not configured in .env");
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
    family: 4, // Force IPv4 to avoid ENETUNREACH error on Render (IPv6 routing is disabled)
  });

  try {
    const dateStr = order.orderDate ? new Date(order.orderDate).toLocaleString() : new Date().toLocaleString();

    // Generate items rows
    const itemsHtml = order.orderDetails && order.orderDetails.length > 0
      ? order.orderDetails
          .map(
            (item) => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eeeeee;">${item.productName}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: center;">x${item.qty}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right;">$${Number(item.productPrice).toFixed(2)}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right; font-weight: bold;">$${Number(item.amount).toFixed(2)}</td>
            </tr>`
          )
          .join("")
      : `<tr><td colspan="4" style="padding: 15px; text-align: center; color: #777777;">No items purchased</td></tr>`;

    const subtotal = Number(order.total || 0);
    const total = Number(order.total || 0);

    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Receipt</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; color: #333333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.08); border: 1px solid #dddddd;">
          
          <!-- Header -->
          <div style="background-color: #007bff; padding: 25px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; font-size: 24px; font-weight: 600;">Payment Successful</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">POS Order Invoice Receipt</p>
          </div>

          <!-- Body -->
          <div style="padding: 25px;">
            <p style="margin-top: 0; font-size: 16px;">Hello,</p>
            <p style="font-size: 14px; line-height: 1.5; color: #555555;">A new payment was successfully completed via ABA Payway. Here are the transaction details:</p>
            
            <!-- Order Meta Info -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px; background-color: #f9f9f9; border-radius: 6px; border: 1px solid #eeeeee;">
              <tr>
                <td style="padding: 10px; font-weight: bold; width: 40%;">Invoice No:</td>
                <td style="padding: 10px; font-family: monospace; font-size: 15px; color: #007bff;">${order.orderNumber}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Date & Time:</td>
                <td style="padding: 10px;">${dateStr}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Customer:</td>
                <td style="padding: 10px;">${order.customer?.name || "Guest"}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Payment Method:</td>
                <td style="padding: 10px;">ABA Payway</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">ABA Reference ID:</td>
                <td style="padding: 10px; font-family: monospace;">${payment.paywayTranId}</td>
              </tr>
            </table>

            <!-- Items Table -->
            <h3 style="border-bottom: 2px solid #007bff; padding-bottom: 8px; margin-bottom: 10px; font-size: 16px; font-weight: 600; color: #333333;">Items Purchased</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 25px;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 10px; text-align: left; font-weight: bold;">Item</th>
                  <th style="padding: 10px; text-align: center; font-weight: bold; width: 15%;">Qty</th>
                  <th style="padding: 10px; text-align: right; font-weight: bold; width: 20%;">Price</th>
                  <th style="padding: 10px; text-align: right; font-weight: bold; width: 20%;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Summary Table -->
            <table style="width: 50%; margin-left: auto; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 10px; text-align: left; color: #666666;">Subtotal:</td>
                <td style="padding: 8px 10px; text-align: right;">$${subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 10px; text-align: left; color: #666666;">Discount (0%):</td>
                <td style="padding: 8px 10px; text-align: right; color: #dc3545;">-$0.00</td>
              </tr>
              <tr>
                <td style="padding: 8px 10px; text-align: left; color: #666666;">Tax (0%):</td>
                <td style="padding: 8px 10px; text-align: right;">$0.00</td>
              </tr>
              <tr style="border-top: 2px solid #333333; font-weight: bold; font-size: 16px;">
                <td style="padding: 10px; text-align: left;">Total Paid:</td>
                <td style="padding: 10px; text-align: right; color: #007bff;">$${total.toFixed(2)}</td>
              </tr>
            </table>

          </div>

          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee; font-size: 12px; color: #777777;">
            <p style="margin: 0;">This is an automated transaction receipt for your purchase.</p>
            <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} POS System. All Rights Reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"POS Notification" <${user}>`,
      to: toEmail,
      subject: `🔔 Payment Invoice: ${order.orderNumber}`,
      html: emailContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email receipt sent successfully. Message ID: ${info.messageId}`);
  } catch (error) {
    console.error("Error sending email alert:", error.message);
  }
}

module.exports = { sendEmailOrderAlert };
