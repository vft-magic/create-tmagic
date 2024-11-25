import path from 'node:path';
import fse from 'fs-extra';

import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
// @ts-ignore
import externalGlobals from 'rollup-plugin-external-globals';

export default defineConfig(({ mode }) => {
  if (['value', 'config', 'event', 'ds:value', 'ds:config', 'ds:event'].includes(mode)) {
    const capitalToken = mode
      .split(':')
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join('');

    const fileName = mode.replace(':', '-');

    return {
      publicDir: './.tmagic/public',
      build: {
        cssCodeSplit: false,
        sourcemap: true,
        minify: false,
        target: 'esnext',
        outDir: `dist/entry/${fileName}`,

        lib: {
          entry: `.tmagic/${fileName}-entry.ts`,
          name: `magicPreset${capitalToken}s`,
          fileName: 'index',
          formats: ['umd'],
        },
      },
      plugins: [
        {
          name: 'vite-plugin-copy-lib-entry',
          apply: 'build',
          enforce: 'post',
          closeBundle() {
            const distPath = path.resolve(__dirname, './dist/entry');
            const publicPath = path.resolve(__dirname, './public/entry');
            fse.copySync(path.resolve(distPath, mode.replace(':', '-')), path.resolve(publicPath, mode.replace(':', '-')));
          },
        },
      ],
    };
  }

  if (['page', 'playground'].includes(mode)) {
    const publicPath = path.resolve(__dirname, './public/entry');
    fse.removeSync(publicPath);

    return {
      plugins: [
        vue(),
        vueJsx(),
        externalGlobals({ 'vue-demi': 'VueDemi', vue: 'Vue' }, { exclude: [`./${mode}/index.html`] }),
        legacy({
          targets: ['defaults', 'not IE 11'],
        }),
      ],

      root: `./${mode}/`,

      publicDir: '../public',

      base: `/runtime/${mode}`,

      optimizeDeps: {
        exclude: ['vue-demi'],
      },

      build: {
        emptyOutDir: true,
        sourcemap: true,
        outDir: path.resolve(process.cwd(), `./dist/${mode}`),
        rollupOptions: {
          external: ['vue', 'vue-demi'],
        },
      },
    };
  }

  return {};
});
