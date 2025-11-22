// Telegram notification utility for order alerts

interface TelegramMessageOptions {
  orderType: "purchase" | "rental";
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  items: Array<{
    gameTitle: string;
    gamePrice: number;
    quantity: number;
  }>;
  subtotal: number;
  deliveryFee?: number;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  rentalDates?: {
    startDate: string;
    endDate: string;
    rentalDays: number;
  };
}

export async function sendTelegramNotification(
  options: TelegramMessageOptions,
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn("Telegram credentials not configured. Skipping notification.");
    return false;
  }

  try {
    const emoji = options.orderType === "purchase" ? "🛒" : "🎮";
    const title =
      options.orderType === "purchase"
        ? "NEW PURCHASE ORDER!"
        : "NEW RENTAL ORDER!";

    // Format items list
    const itemsList = options.items
      .map(
        (item) =>
          `• ${item.gameTitle} (₱${item.gamePrice.toLocaleString()}) x${item.quantity}`,
      )
      .join("\n");

    // Build message
    let message = `${emoji} ${title}\n\n`;
    message += `Order #: ${options.orderNumber}\n`;
    message += `Customer: ${options.customerName}\n`;
    if (options.customerPhone) {
      message += `Phone: ${options.customerPhone}\n`;
    }
    message += `\nItems:\n${itemsList}\n\n`;

    if (options.orderType === "rental" && options.rentalDates) {
      message += `Rental Period:\n`;
      message += `Start: ${new Date(options.rentalDates.startDate).toLocaleDateString()}\n`;
      message += `End: ${new Date(options.rentalDates.endDate).toLocaleDateString()}\n`;
      message += `Duration: ${options.rentalDates.rentalDays} days\n\n`;
    }

    message += `Subtotal: ₱${options.subtotal.toLocaleString()}\n`;
    if (options.deliveryFee !== undefined) {
      message += `Delivery: ₱${options.deliveryFee.toLocaleString()}\n`;
    }
    message += `Total: ₱${options.totalAmount.toLocaleString()}\n\n`;
    message += `Payment: ${options.paymentMethod}\n`;
    message += `Status: ${options.status}\n\n`;

    // Send to Telegram
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Telegram API error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
    return false;
  }
}
