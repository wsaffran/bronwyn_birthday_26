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
  // GitHub Pages serves this repo at https://wsaffran.github.io/bronwyn_birthday_26/
  base: '/bronwyn_birthday_26/',
})
