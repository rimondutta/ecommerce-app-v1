/**
 * TELEGRAM NOTIFICATION UTILITY
 * Sends real-time alerts to the store admin when new orders are placed.
 */

export interface TelegramOrderData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  items: Array<{
    title: string;
    quantity: number;
    price: number;
    color?: string;
    size?: string;
  }>;
  shippingAddress: {
    city: string;
    addressLine1: string;
    phone?: string;
  };
  paymentMethod: string;
}

export async function sendTelegramNotification(order: TelegramOrderData) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('Telegram credentials missing. Notification skipped.');
    return;
  }

  const itemsList = order.items
    .map(item => `• ${item.title} x${item.quantity} (৳${item.price})`)
    .join('\n');

  const message = `
📌*New Order Received!*
--------------------------------
🆔 *Order ID:* #${order.orderId.slice(-8).toUpperCase()}
👤 *Customer:* ${order.customerName}
📞 *Phone:* ${order.shippingAddress.phone}
📧 *Email:* ${order.customerEmail}
💰 *Total:* ৳${order.totalAmount.toLocaleString()}
💳 *Payment:* ${order.paymentMethod.toUpperCase()}

📦 *Items:*
${itemsList}

📍 *Shipping to:*
${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}

🔗 [View Order Details](${process.env.NEXTAUTH_URL}/admin/orders)
  `;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API Error:', errorData);
    } else {
      console.log('Telegram admin notification sent successfully.');
    }
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
}
