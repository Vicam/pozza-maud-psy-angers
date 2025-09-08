/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#264653", 600: "#1f3943", 700: "#192f37" },
        accent:  { DEFAULT: "#2A9D8F" },
        highlight:{ DEFAULT: "#E9C46A" },
        bg:      { DEFAULT: "#FAFAF7" },
        text:    { DEFAULT: "#1F2933" }
      },
      borderRadius: { '2xl': '1.25rem' }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')
  ]
};

