export const rentalContent = {
  hero: {
    badge: "Game Rentals",
    headline: "Play More, Pay Less with SwitchBai Rentals",
    subheadline:
      "Experience premium Nintendo Switch games without the premium price tag. Rent, play, swap, and repeat!",
    description:
      "Get access to the latest Nintendo Switch titles for a fraction of the cost. Perfect for gamers who love variety and smart spending.",
    cta: "Calculate Your Cost",
    trustBadges: [
      {
        icon: "💰",
        text: "Flexible Daily Pricing",
        description: "Starting at ₱60/day",
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
          "Pay the game value upfront (rental fee + deposit = game price). The best rate is automatically applied based on your rental duration.",
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
    durationLabel: "Rental Duration (Days)",
    durations: [
      { days: 1, label: "1 Day" },
      { days: 3, label: "3 Days" },
      { days: 7, label: "1 Week", popular: true },
      { days: 14, label: "2 Weeks", popular: true },
      { days: 30, label: "1 Month" },
    ],
    breakdownLabels: {
      rentalFee: "Rental Fee",
      deposit: "Refundable Deposit",
      totalDue: "Total Due",
      appliedPlan: "Applied Plan",
      promoMessage: "Promo Message",
    },
    note: "Best rate automatically applied — no need to choose a plan!",
  },

  pricingTable: {
    title: "Rental Rates",
    subtitle: "Transparent pricing for all game tiers",
    note: "All prices in Philippine Pesos (₱). Pro-rated pricing automatically calculated for all durations. Maximum rental period is 30 days.",
    headers: ["Game Value", "Daily", "Weekly", "Bi-Weekly", "Monthly"],
    rows: [
      {
        tier: "Tier 1 Games",
        gameValue: 1200,
        dailyRate: 60,
        weeklyRate: 300,
        biWeeklyRate: 550,
        monthlyRate: 950,
      },
      {
        tier: "Tier 2 Games",
        gameValue: 1500,
        dailyRate: 70,
        weeklyRate: 350,
        biWeeklyRate: 650,
        monthlyRate: 1100,
      },
      {
        tier: "Tier 3 Games",
        gameValue: 1900,
        dailyRate: 80,
        weeklyRate: 400,
        biWeeklyRate: 750,
        monthlyRate: 1300,
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
          "Deposit amount varies by game value: Deposit = Game Price - Rental Fee.",
          "You pay upfront: Rental fee + Deposit = Game price (total upfront equals game value).",
          "Your full deposit is refunded when you return the game in good condition.",
          "Deposits are held securely and returned via your preferred payment method within 24 hours of verified return.",
          "The deposit ensures games are returned in good condition and covers any potential damage or loss.",
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
          "Extend your rental anytime at the same daily rate for your game tier.",
          "You must notify us before your due date to avoid late fees.",
          "Extensions are charged at the standard daily rate for your game tier.",
          "Maximum rental period is 30 days. Contact us via phone, email, or Facebook to request an extension.",
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
          "Reach out via phone, email, or Facebook Messenger with your game selection and desired rental duration in days.",
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
        duration: "8 days",
        dailyRate: 70,
        days: 8,
        totalRent: 400,
        deposit: 1100,
        upfrontTotal: 1500,
        refund: 1100,
      },
      steps: [
        "Rental Fee: (₱350 ÷ 7) × 8 days = ₱400",
        "Deposit: ₱1,500 - ₱400 = ₱1,100",
        "You Pay Upfront: ₱400 + ₱1,100 = ₱1,500 (game value)",
        "After Return: Get back ₱1,100 deposit",
        "Your Net Cost: ₱400 (just the rental fee!)",
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
          "The deposit ensures games are returned in good condition. You pay the game value upfront (rental fee + deposit = game price). When you return the game undamaged, you get the full deposit back within 24 hours. For example: 8 days for a ₱1,500 game = pay ₱1,500 upfront (₱400 rental + ₱1,100 deposit), get ₱1,100 back after return.",
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
          "Absolutely! You can extend at the same daily rate anytime. Just notify us before your due date to avoid late fees. Extensions are charged at the standard daily rate for your game's tier.",
      },
      {
        question: "What happens if I lose or damage the game?",
        answer:
          "You're responsible for the game during rental. Normal wear is fine, but if a game is lost or severely damaged, the full game value is deducted from your deposit. Minor damage may result in partial deduction. Always report issues immediately upon receiving the game.",
      },
      {
        question: "Is there a minimum rental period?",
        answer:
          "Yes, the minimum rental period is 1 day. You can rent for 1 day, 1 week, 2 weeks, or up to 1 month (30 days maximum). The system automatically applies the best rate for any duration you choose.",
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
