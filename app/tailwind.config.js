module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        lato2: ['Lato', 'sans-serif'],
        lato : ['Lato', 'sans-serif']
      },
      screens: {
        xs: { max: '600px' },
      },
    },
  },
  plugins: [],
  prefix: 'tw-',
}
