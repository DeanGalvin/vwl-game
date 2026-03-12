import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/vwl-game/', // Tells Vite to use relative paths for GitHub Pages subdirectories
})
