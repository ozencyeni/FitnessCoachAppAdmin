import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1B4332',
        secondary: '#40916C',
        accent: '#52B788',
      },
    },
  },
  plugins: [],
}

export default config
