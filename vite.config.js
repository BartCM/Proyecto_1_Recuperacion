import { resolve } from 'path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        page2: resolve(__dirname, 'new_property.html'),
      },
    },
  },
  plugins: [
    tailwindcss(),
  ],
})