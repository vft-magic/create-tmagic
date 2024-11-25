import path from 'node:path';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

export default defineConfig({
  plugins: [vue(), vueJsx()],

  resolve: {
    alias: [
      { find: /^vue$/, replacement: path.join(__dirname, 'node_modules/vue/dist/vue.esm-bundler.js') },
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
});
