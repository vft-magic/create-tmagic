import { defineConfig } from '@tmagic/cli';

export default defineConfig({
  packages: [
    {
      page: '@tmagic/vue-page',
      container: '@tmagic/vue-container',
      'iterator-container': '@tmagic/vue-iterator-container',
      'page-fragment': '@tmagic/vue-page-fragment', 
      'page-fragment-container': '@tmagic/vue-page-fragment-container'
    },
  ],
  componentFileAffix: '.vue',
  dynamicImport: true,
  npmConfig: {
    client: 'pnpm',
    keepPackageJsonClean: true,
  },
});
