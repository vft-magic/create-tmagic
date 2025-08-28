import { defineConfig } from '@tmagic/cli';

export default defineConfig({
  packages: [
    { container: '@tmagic/react-container' },
    { 'iterator-container': '@tmagic/react-iterator-container' },
    { page: '@tmagic/react-page' },
    { 'page-fragment': '@tmagic/react-page-fragment' },
    { 'page-fragment-container': '@tmagic/react-page-fragment-container' },
  ],
  componentFileAffix: '.tsx',
  dynamicImport: true,
  npmConfig: {
    client: 'pnpm',
    keepPackageJsonClean: true,
  },
});
