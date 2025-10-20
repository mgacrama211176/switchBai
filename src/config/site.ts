export interface ContactInfo {
  email: string;
  phone: string;
  phoneDisplay: string;
  address: string;
  city: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
  color: string;
}

export interface PaymentMethod {
  name: string;
  icon: string;
}

export interface RentalConfig {
  rates: {
    tier1: { gamePrice: number; weeklyRate: number };
    tier2: { gamePrice: number; weeklyRate: number };
    tier3: { gamePrice: number; weeklyRate: number };
  };
  fees: {
    swap: number;
    latePerDay: number;
  };
  policies: {
    minimumRentalWeeks: number;
    meetupMinimumWeeks: number;
  };
  serviceArea: string;
}

export const siteConfig = {
  name: "SwitchBai",
  description:
    "Your trusted source for quality second-hand Nintendo Switch games and rentals. We offer the best prices, verified quality, and exceptional customer service.",
  foundedYear: 2023,

  contact: {
    email: "maruronu@gmail.com",
    phone: "+639396810206",
    phoneDisplay: "+63 939 681 0206",
    address: "Cebu City, Philippines",
    city: "Cebu City",
  } as ContactInfo,

  social: [
    {
      name: "Facebook",
      url: "https://www.facebook.com/SwitchTaBai/",
      icon: "📘",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "Instagram",
      url: "https://instagram.com/switchbai",
      icon: "📷",
      color:
        "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
    },
    {
      name: "Twitter",
      url: "https://twitter.com/switchbai",
      icon: "🐦",
      color: "bg-blue-400 hover:bg-blue-500",
    },
    {
      name: "YouTube",
      url: "https://youtube.com/switchbai",
      icon: "📺",
      color: "bg-red-600 hover:bg-red-700",
    },
    {
      name: "TikTok",
      url: "https://tiktok.com/@switchbai",
      icon: "🎵",
      color: "bg-black hover:bg-gray-900",
    },
  ] as SocialLink[],

  paymentMethods: [
    { name: "GCash", icon: "📱" },
    { name: "Bank Transfer", icon: "🏦" },
    { name: "Cash on Pickup", icon: "💵" },
  ] as PaymentMethod[],

  rental: {
    rates: {
      tier1: {
        gamePrice: 1200,
        weeklyRate: 300,
      },
      tier2: {
        gamePrice: 1500,
        weeklyRate: 350,
      },
      tier3: {
        gamePrice: 1900,
        weeklyRate: 400,
      },
    },
    fees: {
      swap: 100,
      latePerDay: 50,
    },
    policies: {
      minimumRentalWeeks: 1,
      meetupMinimumWeeks: 2,
    },
    serviceArea: "Cebu City only",
  } as RentalConfig,

  officeHours: {
    weekday: "9:00 AM - 6:00 PM",
    saturday: "10:00 AM - 4:00 PM",
    sunday: "Closed",
  },
};
