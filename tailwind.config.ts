import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lameRed: "#ff4554",
        funBlue: "#00c3e3",
        makeMeClean: "#ffffff",
        success: "#059669",
        neutral: "#374151",
      },
    },
  },
  plugins: [],
} satisfies Config;
