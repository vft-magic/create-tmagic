import { defineConfig } from '@tmagic/cli';

export default defineConfig({
  packages: [
    { button: '@tmagic/react-button' },
    { container: '@tmagic/react-container' },
    { img: '@tmagic/react-img' },
    { 'iterator-container': '@tmagic/react-iterator-container' },
    { overlay: '@tmagic/react-overlay' },
    { page: '@tmagic/react-page' },
    { 'page-fragment': '@tmagic/react-page-fragment' },
    { 'page-fragment-container': '@tmagic/react-page-fragment-container' },
    { 'text': '@tmagic/react-text' },
  ],
  componentFileAffix: '.tsx',
  dynamicImport: true,
  npmConfig: {
    client: 'pnpm',
    keepPackageJsonClean: true,
  },
});
