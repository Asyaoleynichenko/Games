import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    // `::` is dual-stack on macOS/Node, so both localhost ([::1]) and
    // 127.0.0.1 reach the same server. Binding only one stack caused
    // Chromium ERR_CONNECTION_RESET on the other.
    host: '::',
    strictPort: true,
  },
})
