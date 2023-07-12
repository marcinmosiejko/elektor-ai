/** @type {import('tailwindcss').Config} */
import daisyUiThemes from "daisyui/src/theming/themes";

// this function handles the opacity of color
function withOpacityValue(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `hsl(var(${variable}))`;
    }
    return `hsl(var(${variable}) / ${opacityValue})`;
  };
}

module.exports = {
  // darkMode: 'class',
  content: [
    "node_modules/daisyui/dist/**/*.js",
    "node_modules/react-daisyui/dist/**/*.js",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  daisyui: {
    themes: [
      {
        light: {
          ...daisyUiThemes["[data-theme=light]"],
          primary: "#14b8a6",
          secondary: "#ffffff",
          accent: "#999999",
          neutral: "#2a323c",
          "base-100": "#f3f4f6",
          info: "#3abff8",
          success: "#2dd4bf",
          warning: "#fbbd23",
          error: "#f87272",
          "--primary-s1": "168 84% 82%",
          "--border": "240 5% 75%",
          "--shadow": "240 5% 25%",
        },
        dark: {
          ...daisyUiThemes["[data-theme=dark]"],
          primary: "#14b8a6",
          secondary: "#27272a",
          accent: "#71717a",
          neutral: "#6b7280",
          "base-100": "#18181b",
          info: "#3abff8",
          success: "#2dd4bf",
          warning: "#fbbd23",
          error: "#f87272",
          "--primary-s1": "175 84% 32%",
          "--border": "240 5% 65%",
          "--shadow": "240 5% 100%",
        },
      },
    ],
  },
  theme: {
    extend: {
      colors: {
        "primary-s1": withOpacityValue("--primary-s1"),
        border: withOpacityValue("--border"),
        "always-dark": "#18181b",
      },
      animation: {
        aiAvatarInfinite: "aiAvatarInfinite 5s ease-in-out infinite",
        aiAvatarOnce: "aiAvatarOnce 5s ease-in-out",
      },
      keyframes: {
        aiAvatarInfinite: {
          "0%, 20%": {
            transform: "rotate(0deg)",
          },
          "5%": {
            transform: "rotate(-30deg)",
          },
          "15%": {
            transform: "rotate(30deg)",
          },
        },
        aiAvatarOnce: {
          "0%, 20%": {
            transform: "rotate(0deg)",
          },
          "5%": {
            transform: "rotate(-30deg) scale(1.2)",
          },
          "15%": {
            transform: "rotate(30deg)",
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("daisyui"),
    require("tailwindcss-font-inter"),
  ],
};
