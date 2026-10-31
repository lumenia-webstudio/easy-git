import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':   ['react', 'react-dom'],
          'vendor-xterm':   ['@xterm/xterm', '@xterm/addon-fit', '@xterm/addon-web-links'],
          'vendor-lucide':  ['lucide-react'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:3001',
      '/terminal': {
        target: 'ws://127.0.0.1:3001',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
