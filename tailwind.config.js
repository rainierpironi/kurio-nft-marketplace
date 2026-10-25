import animate from "tailwindcss-animate"

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      colors: {
        border: "#2E2520",
        input: "#2E2520",
        ring: "#D98A53",
        background: "#0F0C0A",
        foreground: "#F2F2F2",
        primary: {
          DEFAULT: "#D98A53",
          foreground: "#0F0C0A",
        },
        secondary: {
          DEFAULT: "#1A1512",
          foreground: "#F2F2F2",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#F2F2F2",
        },
        muted: {
          DEFAULT: "#1A1512",
          foreground: "#827B75",
        },
        accent: {
          DEFAULT: "#D98A53",
          foreground: "#0F0C0A",
        },
        popover: {
          DEFAULT: "#1A1512",
          foreground: "#F2F2F2",
        },
        card: {
          DEFAULT: "#1A1512",
          foreground: "#F2F2F2",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [animate],
}