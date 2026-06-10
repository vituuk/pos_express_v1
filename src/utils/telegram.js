const axios = require("axios");

/**
 * Sends a notification to a Telegram chat/group when an order is completed successfully.
 * @param {object} order - The Sequelize Order object (containing customer and orderDetails).
 * @param {object} payment - The Sequelize Payment object.
 */
async function sendTelegramOrderAlert(order, payment) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured in .env");
    return;
  }

  try {
    // Format order date
    const dateStr = order.orderDate ? new Date(order.orderDate).toLocaleString() : new Date().toLocaleString();

    // Format list of items
    const itemsText = order.orderDetails && order.orderDetails.length > 0
      ? order.orderDetails
          .map(
            (item) =>
              `• <b>${item.productName}</b> (x${item.qty}) - $${Number(item.productPrice).toFixed(2)}`
          )
          .join("\n")
      : "No items";

    const subtotal = Number(order.total || 0);
    const total = Number(order.total || 0);

    const message = `
🔔 <b>New Successful POS Order!</b>
--------------------------------------
<b>Invoice No:</b> <code>${order.orderNumber}</code>
<b>Date & Time:</b> ${dateStr}
<b>Customer:</b> ${order.customer?.name || "Guest"}
<b>Payment Method:</b> ABA Payway
<b>ABA Ref ID:</b> <code>${payment.paywayTranId}</code>

📦 <b>Items Purchased:</b>
${itemsText}

💰 <b>Order Summary:</b>
<b>Subtotal:</b> $${subtotal.toFixed(2)}
<b>Discount (0%):</b> -$0.00
<b>Tax (0%):</b> $0.00
<b>Total Paid:</b> $${total.toFixed(2)}
--------------------------------------
✅ Payment completed successfully via ABA Payway!
`;

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    });
    console.log(`Telegram alert sent successfully for order: ${order.orderNumber}`);
  } catch (error) {
    console.error("Error sending Telegram alert:", error.response ? error.response.data : error.message);
  }
}

module.exports = { sendTelegramOrderAlert };
