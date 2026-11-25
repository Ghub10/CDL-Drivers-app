import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    /** If 5180 is taken (e.g. old dev server), use 5181 instead of failing */
    strictPort: false,
  },
  preview: {
    port: 4180,
    strictPort: true,
  },
})
