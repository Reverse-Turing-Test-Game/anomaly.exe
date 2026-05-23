import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
  // 중괄호 위치를 여기로 옮겼습니다.
  assetsInclude: ['**/*.svg', '**/*.csv'],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})