import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue(),
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],

  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },

  server: {
    host: '0.0.0.0',
    port: 8098,
    strictPort: true,
    proxy: {
      '^/runtime': {
        target: 'http://127.0.0.1:8078',
        changeOrigin: true,
        prependPath: false,
      },
    },
  },

  preview: {
    proxy: {},
  },

  build: {
    sourcemap: true,
  },
});
