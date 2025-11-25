/**
 * Initial FAQ/Knowledge Base data for SwitchBai support chat
 * This data will be indexed with vector embeddings for semantic search
 */

export interface FAQEntry {
  question: string;
  answer: string;
  category: "payment" | "rental" | "trade" | "shipping" | "general";
  metadata?: {
    tags?: string[];
    priority?: number;
  };
}

export const faqData: FAQEntry[] = [
  // Payment FAQs
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept Cash, GCash, Bank Transfer, and Meet-up payments. You can pay in cash when you meet up with us, or use GCash or bank transfer for online transactions.",
    category: "payment",
    metadata: {
      tags: ["payment", "methods", "gcash", "cash"],
      priority: 10,
    },
  },
  {
    question: "Can I pay using GCash?",
    answer:
      "Yes! We accept GCash payments. You can send the payment to our GCash number after confirming your order. We'll provide the GCash details once your order is confirmed.",
    category: "payment",
    metadata: {
      tags: ["payment", "gcash"],
      priority: 9,
    },
  },
  {
    question: "Do you accept credit cards?",
    answer:
      "Currently, we accept Cash, GCash, Bank Transfer, and Meet-up payments. Credit card payments are not available at this time, but we're working on adding more payment options in the future.",
    category: "payment",
    metadata: {
      tags: ["payment", "credit card"],
      priority: 5,
    },
  },

  // Rental FAQs
  {
    question: "How does game rental work?",
    answer:
      "You can rent games from us on a weekly basis. The rental rate depends on the game. Simply add the game to your cart and select the rental option. You'll need to return the game after the rental period ends.",
    category: "rental",
    metadata: {
      tags: ["rental", "how it works"],
      priority: 10,
    },
  },
  {
    question: "What is the rental period?",
    answer:
      "Our games are rented on a weekly basis. The rental period starts from when you receive the game and lasts for 7 days. You can extend the rental if needed by contacting us.",
    category: "rental",
    metadata: {
      tags: ["rental", "period", "duration"],
      priority: 9,
    },
  },
  {
    question: "How much does it cost to rent a game?",
    answer:
      "Rental prices vary by game and are listed on each game's page. The rental rate is a weekly fee. Check the game details to see the specific rental price for the game you're interested in.",
    category: "rental",
    metadata: {
      tags: ["rental", "price", "cost"],
      priority: 8,
    },
  },
  {
    question: "What happens if I damage or lose a rented game?",
    answer:
      "If a rented game is damaged or lost, you'll be responsible for the replacement cost. We recommend handling games with care. Please contact us immediately if something happens to a rented game.",
    category: "rental",
    metadata: {
      tags: ["rental", "damage", "lost"],
      priority: 7,
    },
  },

  // Trade FAQs
  {
    question: "How does game trading work?",
    answer:
      "You can trade your games with us! We accept games in good condition. There are three types of trades: Trade Up (pay price difference + ₱200 fee), Even Trade (₱200 fee only), and Trade Down (no fee, you receive credit).",
    category: "trade",
    metadata: {
      tags: ["trade", "how it works"],
      priority: 10,
    },
  },
  {
    question: "What is the trade fee?",
    answer:
      "For Trade Up and Even Trade transactions, there is a ₱200 trade fee. Trade Down transactions have no fee - you'll receive store credit for the difference. The fee helps cover our processing and evaluation costs.",
    category: "trade",
    metadata: {
      tags: ["trade", "fee", "cost"],
      priority: 9,
    },
  },
  {
    question: "What condition do games need to be in for trading?",
    answer:
      "Games should be in good, playable condition with the original case and artwork. The game cartridge should work properly. We'll evaluate your games when you bring them in for trade.",
    category: "trade",
    metadata: {
      tags: ["trade", "condition", "requirements"],
      priority: 8,
    },
  },
  {
    question: "Can I trade multiple games at once?",
    answer:
      "Yes! You can trade multiple games in a single transaction. This can help you get better value, especially if you're trading up to a more expensive game.",
    category: "trade",
    metadata: {
      tags: ["trade", "multiple", "bulk"],
      priority: 6,
    },
  },

  // Shipping/Delivery FAQs
  {
    question: "Do you offer delivery?",
    answer:
      "Yes, we offer delivery options! You can choose between meet-up or delivery when placing your order. Delivery options and fees will be discussed when you confirm your order.",
    category: "shipping",
    metadata: {
      tags: ["delivery", "shipping"],
      priority: 9,
    },
  },
  {
    question: "Where are you located?",
    answer:
      "We're located in Cebu City, Philippines. You can meet up with us for your orders, or we can arrange delivery within Cebu. Contact us for specific location details and meet-up arrangements.",
    category: "shipping",
    metadata: {
      tags: ["location", "cebu"],
      priority: 8,
    },
  },
  {
    question: "How long does delivery take?",
    answer:
      "Delivery time depends on your location within Cebu. Typically, deliveries within Cebu City take 1-2 days. We'll provide an estimated delivery time when you place your order.",
    category: "shipping",
    metadata: {
      tags: ["delivery", "time", "duration"],
      priority: 7,
    },
  },

  // General FAQs
  {
    question: "Do you have games in stock?",
    answer:
      "Stock availability is shown on each game's page. If a game shows available stock, we have it ready. If it's out of stock, you can contact us to check when we might get more copies.",
    category: "general",
    metadata: {
      tags: ["stock", "availability"],
      priority: 9,
    },
  },
  {
    question: "Can I return a game I purchased?",
    answer:
      "We accept returns for defective games within a reasonable time frame. Please contact us immediately if you receive a game that doesn't work. We'll help you with a replacement or refund.",
    category: "general",
    metadata: {
      tags: ["return", "refund", "defective"],
      priority: 7,
    },
  },
  {
    question: "Do you sell used games?",
    answer:
      "Yes! We sell both new and used games. All games are tested to ensure they work properly. The condition and price will be clearly indicated on each game listing.",
    category: "general",
    metadata: {
      tags: ["used", "new", "condition"],
      priority: 6,
    },
  },
  {
    question: "How can I contact you?",
    answer:
      "You can contact us through our support chat, or reach out directly for order inquiries. We're here to help with any questions about games, orders, rentals, or trades!",
    category: "general",
    metadata: {
      tags: ["contact", "support"],
      priority: 8,
    },
  },
];
