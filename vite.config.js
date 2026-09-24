import { copyFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'spa-github-pages',
      closeBundle() {
        copyFileSync('dist/index.html', 'dist/404.html')
      },
    },
  ],
  // Custom domain serves the site at the root of https://bronwynsbirthday.com/
  base: '/',
})
