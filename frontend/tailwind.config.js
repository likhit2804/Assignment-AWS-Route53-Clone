/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aws: {
          nav: "#232f3e",          // AWS Top Header Dark Navy
          navHover: "#16191f",     // AWS Darker Hover
          sidebar: "#f2f3f3",      // AWS Light Sidebar background
          sidebarActive: "#0073bb", // AWS Active tab blue accent
          orange: "#ec7211",       // AWS Primary Action Orange Button
          orangeHover: "#eb5f07",  // AWS Button Hover
          blue: "#0073bb",         // AWS Link Blue
          border: "#eaedd1",       // AWS Light Table Border
          bg: "#fafafa",           // AWS Main Content Background
          text: "#16191f",         // AWS Main Text Body
          textMuted: "#545b64",    // AWS Muted Secondary Text
          rowHover: "#f1f3f3",     // AWS Table Row Hover
          rowActive: "#f2f8fd",    // AWS Selected Row Light Blue
        },
      },
    },
  },
  plugins: [],
};
