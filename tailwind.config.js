const { blackA, violet } = require('@radix-ui/colors');

module.exports = {
  content: ['./source/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ...blackA,
        ...violet,
      },
    },
  },
  plugins: [],
  // disable base styles, fixes button position
  corePlugins: {
    preflight: false,
  },
};
