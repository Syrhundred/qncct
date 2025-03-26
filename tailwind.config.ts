import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      container: {
        padding: {
          DEFAULT: "1.25rem",
        },
      },
      colors: {
        background: "#f1f1f1",
        lightgray: "#888888",
      },
      backgroundImage: {
        gradient:
          "linear-gradient(to right, rgba(20, 78, 240, 0.84) 0%, #5028FB 57%, #641BFE 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
