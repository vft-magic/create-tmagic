import { createApp } from 'vue';

import TMagicApp, { DataSourceManager, DeepObservedData } from '@tmagic/core';

import App from './App.vue';

import '@tmagic/core/resetcss.css';

DataSourceManager.registerObservedData(DeepObservedData);

Promise.all([
  import('../.tmagic/comp-entry'),
  import('../.tmagic/plugin-entry'),
  import('../.tmagic/datasource-entry'),
]).then(([components, plugins, dataSources]) => {
  const vueApp = createApp(App);

  const app = new TMagicApp({
    ua: window.navigator.userAgent,
    platform: 'editor',
  });

  if (app.env.isWeb) {
    app.setDesignWidth(window.document.documentElement.getBoundingClientRect().width);
  }

  Object.entries(components.default).forEach(([type, component]: [string, any]) => {
    app.registerComponent(type, component);
  });

  Object.entries(dataSources.default).forEach(([type, ds]: [string, any]) => {
    DataSourceManager.register(type, ds);
  });

  Object.values(plugins.default).forEach((plugin: any) => {
    vueApp.use(plugin, { app });
  });

  window.appInstance = app;
  vueApp.config.globalProperties.app = app;
  vueApp.provide('app', app);

  vueApp.mount('#app');
});
