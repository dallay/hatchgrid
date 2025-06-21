import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~/components': path.resolve(__dirname, './src/components'),
      '~/utils': path.resolve(__dirname, './src/lib/utils.ts'),
      '~/lib': path.resolve(__dirname, './src/lib'),
      '@/composables': path.resolve(__dirname, './src/composables'),
    },
  },
})
