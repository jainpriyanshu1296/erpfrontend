import type { Config } from 'tailwindcss';
const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: { extend: { colors: { primary: '#4f46e5' } } },
  plugins: []
};
export default config;
