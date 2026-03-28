import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-manrope)", "var(--font-dm)", "var(--font-noto)", "system-ui", "sans-serif"],
        tamil: ["var(--font-noto)", "Latha", "sans-serif"],
        display: ["var(--font-literata)", "var(--font-dm)", "Georgia", "serif"],
        /** Parchment UI — display serif (mockup: Playfair) */
        headline: ["var(--font-playfair)", "var(--font-literata)", "Georgia", "serif"],
        body: ["var(--font-manrope)", "var(--font-dm)", "system-ui", "sans-serif"],
      },
      fontSize: {
        /** Eyebrows, meta labels — still readable on judges’ screens */
        "ui-sm": ["0.875rem", { lineHeight: "1.45" }],
        /** Default UI chrome (nav, buttons, helper text) */
        ui: ["1rem", { lineHeight: "1.5" }],
        /** Body / comfortable reading */
        "ui-lg": ["1.125rem", { lineHeight: "1.55" }],
        /** In-app section titles below page H1 */
        "display-tight": ["1.5rem", { lineHeight: "1.3" }],
      },
    },
  },
  plugins: [],
};
export default config;
