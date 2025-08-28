import path from 'node:path';

import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue(),
    legacy({
      targets: ['defaults', 'not IE 11'],
    })
  ],

  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },

  resolve: {
    alias: [
      { find: /^vue$/, replacement: path.join(__dirname, 'node_modules/vue') },
    ],
  },

  root: './',

  base: '/runtime/',

  publicDir: 'public',

  optimizeDeps: {
    exclude: ['vue-demi'],
  },

  server: {
    host: '0.0.0.0',
    port: 8078,
    strictPort: true,
  },

  build: {
    rollupOptions: {
      input: {
        page: path.resolve(__dirname, './page/index.html'),
        playground: path.resolve(__dirname, './playground/index.html'),
      },
    },
  },
});
