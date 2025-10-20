export const rentalContent = {
  hero: {
    badge: "Game Rentals",
    headline: "Play More, Pay Less with SwitchBai Rentals",
    subheadline:
      "Experience premium Nintendo Switch games without the premium price tag. Rent, play, swap, and repeat!",
    description:
      "Get access to the latest Nintendo Switch titles for a fraction of the cost. Perfect for gamers who love variety and smart spending.",
    cta: "See Pricing",
    trustBadges: [
      {
        icon: "💰",
        text: "Affordable Weekly Rates",
        description: "Starting at ₱300/week",
      },
      {
        icon: "🔄",
        text: "Easy Game Swaps",
        description: "Switch games anytime",
      },
      {
        icon: "🎮",
        text: "Premium Titles",
        description: "Latest Switch games",
      },
    ],
  },

  howItWorks: {
    title: "How Game Rentals Work",
    subtitle:
      "Start playing your favorite Nintendo Switch games in 4 simple steps",
    steps: [
      {
        number: "01",
        title: "Browse & Select",
        description:
          "Choose from our extensive collection of Nintendo Switch games. We have the latest releases and classic favorites.",
        icon: "🔍",
      },
      {
        number: "02",
        title: "Pay Rent + Deposit",
        description:
          "Pay your weekly rental fee plus a refundable deposit (equal to game value minus one week's rent). Total upfront equals the game price.",
        icon: "💳",
      },
      {
        number: "03",
        title: "Play & Enjoy",
        description:
          "Receive your game via delivery or pickup. Play as long as you want—extend weekly, swap for another title, or return anytime.",
        icon: "🎮",
      },
      {
        number: "04",
        title: "Return & Get Refunded",
        description:
          "Return the game in good condition and get your full deposit back. It's that simple!",
        icon: "✅",
      },
    ],
  },

  pricingCalculator: {
    title: "Calculate Your Rental Cost",
    subtitle:
      "See exactly how much you'll pay upfront and get back as a deposit",
    gamePriceLabel: "Select Game Value",
    durationLabel: "Rental Duration",
    durations: [
      { weeks: 1, label: "1 Week" },
      { weeks: 2, label: "2 Weeks", popular: true },
      { weeks: 4, label: "1 Month" },
    ],
    breakdownLabels: {
      weeklyRate: "Weekly Rate",
      totalRent: "Total Rental Cost",
      deposit: "Refundable Deposit",
      upfront: "You Pay Upfront",
      refund: "You Get Back",
    },
    note: "Deposit = Game Price - Weekly Rent. Your upfront payment always equals the game price!",
  },

  pricingTable: {
    title: "Rental Rates",
    subtitle: "Transparent pricing for all game tiers",
    note: "All prices in Philippine Pesos (₱). Deposit refunded upon return.",
    headers: ["Game Value", "Weekly Rate", "2 Weeks", "1 Month"],
    rows: [
      {
        tier: "Tier 1 Games",
        gameValue: 1200,
        weeklyRate: 300,
        twoWeeks: 600,
        oneMonth: 1000,
      },
      {
        tier: "Tier 2 Games",
        gameValue: 1500,
        weeklyRate: 350,
        twoWeeks: 700,
        oneMonth: 1400,
      },
      {
        tier: "Tier 3 Games",
        gameValue: 1900,
        weeklyRate: 400,
        twoWeeks: 800,
        oneMonth: 1600,
      },
    ],
    popularLabel: "Most Popular",
  },

  policies: {
    title: "Rental Policies",
    subtitle: "Everything you need to know about renting from SwitchBai",
    items: [
      {
        id: "deposit",
        title: "Deposit Policy",
        icon: "💰",
        content: [
          "Your deposit equals the game's price minus one week's rental fee.",
          "For example, a ₱1,200 game with ₱300 weekly rent = ₱900 deposit.",
          "Another example: a ₱1,900 game with ₱400 weekly rent = ₱1,500 deposit.",
          "You pay upfront: Rental fee + Deposit = Game price.",
          "Your full deposit is refunded when you return the game in good condition.",
          "Deposits are held securely and returned via your preferred payment method within 24 hours of verified return.",
        ],
      },
      {
        id: "swap",
        title: "Game Swap Policy",
        icon: "🔄",
        content: [
          "Swap fee: ₱100 per swap.",
          "Available for all rental durations.",
          "For rentals of 2 weeks or longer, you'll receive credits for unused days when swapping.",
          "Credits can be applied to your next rental or swap.",
          "To swap, contact us before your rental period ends. We'll arrange pickup of the current game and delivery of your new selection.",
        ],
      },
      {
        id: "extension",
        title: "Extension Policy",
        icon: "⏱️",
        content: [
          "Extend your rental anytime at the same weekly rate.",
          "You must notify us before your due date to avoid late fees.",
          "Extensions are charged at the standard weekly rate for your game tier.",
          "Contact us via phone, email, or Facebook to request an extension.",
          "Payment for extensions must be made before the new extended due date.",
        ],
      },
      {
        id: "late",
        title: "Late Fees",
        icon: "⚠️",
        content: [
          "Late fee: ₱50 per day.",
          "There is no grace period. Fees apply immediately after the due date.",
          "Late fees are deducted from your deposit before refund.",
          "To avoid late fees, return on time or request an extension before your due date.",
          "Multiple late returns may affect your ability to rent in the future.",
        ],
      },
      {
        id: "delivery",
        title: "Delivery & Meet-up",
        icon: "🚚",
        content: [
          "Delivery is available for all rentals in Cebu City.",
          "Customer shoulders shipping costs both ways (delivery and return).",
          "Meet-up option is available only for rentals of 2 weeks or longer.",
          "Meet-up locations are coordinated based on mutual convenience within Cebu City.",
          "Delivery typically takes 1-2 business days within Cebu City.",
        ],
      },
      {
        id: "damage",
        title: "Lost or Damaged Items",
        icon: "🛡️",
        content: [
          "You are responsible for the game during the rental period.",
          "Normal wear and tear is acceptable.",
          "If a game is lost or severely damaged beyond playability, the full game value will be deducted from your deposit.",
          "Minor damage (scratches that don't affect gameplay) may result in partial deduction.",
          "Report any issues immediately upon receiving the game to avoid liability.",
          "All games are tested before shipping to ensure they're in perfect working condition.",
        ],
      },
    ],
  },

  checkout: {
    title: "How to Complete Your Rental",
    subtitle: "Simple payment and delivery process",
    steps: [
      {
        number: "1",
        title: "Select Your Game",
        description:
          "Browse our game collection and choose the title you want to rent. Note the game's price tier (₱1,500 or ₱1,900).",
      },
      {
        number: "2",
        title: "Contact Us",
        description:
          "Reach out via phone, email, or Facebook Messenger with your game selection and desired rental duration.",
      },
      {
        number: "3",
        title: "Make Payment",
        description:
          "Pay the upfront amount (rental fee + deposit) using your preferred payment method. We'll send you the exact amount and payment details.",
      },
      {
        number: "4",
        title: "Receive Your Game",
        description:
          "Get your game delivered to your address or arrange a meet-up (2+ week rentals only). Start playing!",
      },
    ],
    paymentMethods: {
      title: "Accepted Payment Methods",
      subtitle: "Choose what works best for you",
    },
    example: {
      title: "Payment Breakdown Example",
      subtitle: "Here's exactly what you'll pay",
      scenario: {
        game: "₱1,500 game",
        duration: "2 weeks",
        weeklyRate: 350,
        weeks: 2,
        totalRent: 700,
        deposit: 1150,
        upfrontTotal: 1500,
        refund: 1150,
      },
      steps: [
        "Total Rental Cost: ₱350 × 2 weeks = ₱700",
        "Refundable Deposit: ₱1,500 - ₱350 = ₱1,150",
        "You Pay Upfront: ₱700 + ₱1,150 = ₱1,500",
        "After Return: Get back ₱1,150 deposit",
        "Your Net Cost: ₱700 (just the rental fee!)",
      ],
    },
  },

  faq: {
    title: "Frequently Asked Questions",
    subtitle: "Got questions? We've got answers!",
    items: [
      {
        question: "How does the deposit system work?",
        answer:
          "The deposit ensures games are returned in good condition. You pay the rental fee plus a deposit upfront (totaling the game's price). When you return the game undamaged, you get the full deposit back within 24 hours. For example: ₱1,200 game at ₱300/week = pay ₱1,200 upfront, get ₱900 back after return. Or ₱1,500 game at ₱350/week = pay ₱1,500 upfront, get ₱1,150 back.",
      },
      {
        question: "Can I swap games during my rental period?",
        answer:
          "Yes! Game swaps cost ₱100. If you've rented for 2 weeks or longer and want to swap before your period ends, you'll get credits for unused days that can be applied to your next rental. Just contact us to arrange the swap.",
      },
      {
        question: "What if I return the game late?",
        answer:
          "Late fees are ₱50 per day with no grace period. The fee is deducted from your deposit. To avoid late fees, return on time or contact us to extend your rental before the due date.",
      },
      {
        question: "How does game delivery work?",
        answer:
          "We deliver to anywhere in Cebu City. You shoulder shipping costs both ways (sending the game to you and returning it to us). Delivery typically takes 1-2 business days. For rentals of 2 weeks or longer, meet-up is also available.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept GCash, Bank Transfer, and Cash on Pickup. After you select your game and rental duration, we'll provide payment details and the exact amount (rental fee + deposit).",
      },
      {
        question: "Can I extend my rental period?",
        answer:
          "Absolutely! You can extend at the same weekly rate anytime. Just notify us before your due date to avoid late fees. Extensions are charged at the standard weekly rate for your game's tier.",
      },
      {
        question: "What happens if I lose or damage the game?",
        answer:
          "You're responsible for the game during rental. Normal wear is fine, but if a game is lost or severely damaged, the full game value is deducted from your deposit. Minor damage may result in partial deduction. Always report issues immediately upon receiving the game.",
      },
      {
        question: "Is there a minimum rental period?",
        answer:
          "Yes, the minimum rental period is 1 week. You can rent for 1 week, 2 weeks, 1 month, or longer. The 2-week option is our most popular choice, offering the best value and flexibility.",
      },
      {
        question: "Can I rent multiple games at once?",
        answer:
          "Yes! You can rent multiple games simultaneously. Each game requires its own rental fee and deposit. Contact us with your selections, and we'll calculate the total amount and coordinate delivery.",
      },
      {
        question: "When will I get my deposit back?",
        answer:
          "Deposits are refunded within 24 hours after we verify the returned game is in good condition. We'll return it via your original payment method (GCash, bank transfer, or cash if pickup).",
      },
    ],
  },

  cta: {
    title: "Ready to Start Renting?",
    subtitle:
      "Join hundreds of happy gamers in Cebu City enjoying premium games at affordable prices",
    primaryButton: "Browse Games",
    secondaryButton: "Contact Us",
  },
};
