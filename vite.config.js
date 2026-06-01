import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'https://huggingface.co/spaces/sufiyansikander01/Shuruker-Backend',
      '/verify-token': 'https://huggingface.co/spaces/sufiyansikander01/Shuruker-Backend',
      '/data': 'https://huggingface.co/spaces/sufiyansikander01/Shuruker-Backend',
      '/uploads': 'https://huggingface.co/spaces/sufiyansikander01/Shuruker-Backend'
    }
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || '')
  }
})