import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:5000',
      '/verify-token': 'http://127.0.0.1:5000',
      '/data': 'http://127.0.0.1:5000',
      '/static': 'http://127.0.0.1:5000',
      '/logout': 'http://127.0.0.1:5000',
    },
  },
});