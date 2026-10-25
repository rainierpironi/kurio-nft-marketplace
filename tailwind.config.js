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
        "2xl": "1320px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['"Space Mono"', 'monospace'],
        mono: ['"Space Mono"', 'monospace'],
      },
      colors: {
        border: "#342820",
        input: "#342820",
        ring: "#C88246",
        background: "#14100D",
        foreground: "#F5EFEA",
        primary: {
          DEFAULT: "#C88246",
          foreground: "#14100D",
        },
        secondary: {
          DEFAULT: "#221A14",
          foreground: "#F5EFEA",
        },
        destructive: {
          DEFAULT: "#E04F4F",
          foreground: "#F5EFEA",
        },
        muted: {
          DEFAULT: "#221A14",
          foreground: "#A89B8E",
        },
        accent: {
          DEFAULT: "#C88246",
          foreground: "#14100D",
        },
        popover: {
          DEFAULT: "#1E1712",
          foreground: "#F5EFEA",
        },
        card: {
          DEFAULT: "#1E1712",
          foreground: "#F5EFEA",
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
