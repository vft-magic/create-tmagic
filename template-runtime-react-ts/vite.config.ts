import path from 'node:path';

import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import reactRefresh from '@vitejs/plugin-react-refresh';
import commonjs from 'vite-plugin-commonjs';

export default defineConfig({
  plugins: [
    commonjs({
      filter: (id) => {
        if (id.includes('qrcode')) {
          return true;
        }
        return false;
      },
    }),
    reactRefresh(),
    legacy({
      targets: ['defaults', 'not IE 11'],
    })
  ],

  resolve: {
    alias: [
      { find: /^react$/, replacement: path.join(__dirname, 'node_modules/react/index.js') },
      { find: /^react-dom$/, replacement: path.join(__dirname, 'node_modules/react-dom/index.js') },
      { find: /^qrcode/, replacement: path.join(__dirname, './node_modules/qrcode') },
    ],
  },

  root: './',

  base: '/runtime/',

  publicDir: 'public',

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
