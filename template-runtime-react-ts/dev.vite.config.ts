import path from 'path';

import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';

export default defineConfig({
  plugins: [reactRefresh()],

  resolve: {
    alias: [
      { find: /^react$/, replacement: path.join(__dirname, 'node_modules/react/index.js') },
      { find: /^react-dom$/, replacement: path.join(__dirname, 'node_modules/react-dom/index.js') },
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
});
