import React from 'react';
import { createRoot } from 'react-dom/client';

import Core, { DataSourceManager, DeepObservedData } from '@tmagic/core';
import { AppContent, useEditorDsl } from '@tmagic/react-runtime-help';

import components from '../.tmagic/comp-entry';
import dataSources from '../.tmagic/datasource-entry';
import plugins from '../.tmagic/plugin-entry';

import App from './App';

import '@tmagic/core/resetcss.css';

declare global {
  interface Window {
    appInstance: Core;
  }
}

DataSourceManager.registerObservedData(DeepObservedData);

Object.entries(dataSources).forEach(([type, ds]: [string, any]) => {
  DataSourceManager.register(type, ds);
});

const app = new Core({
  ua: window.navigator.userAgent,
  platform: 'editor',
});

if (app.env.isWeb) {
  app.setDesignWidth(window.document.documentElement.getBoundingClientRect().width);
}

window.appInstance = app;

const root = createRoot(document.getElementById('root')!);

const renderDom = () => {
  root.render(
    <React.StrictMode>
      <AppContent.Provider value={app}>
        <App />
      </AppContent.Provider>
    </React.StrictMode>,
  );

  setTimeout(() => {
    // @ts-ignore
    window.magic.onPageElUpdate(document.querySelector('.magic-ui-page'));
  });
};

Object.keys(components).forEach((type: string) => app.registerComponent(type, components[type]));

Object.values(plugins).forEach((plugin: any) => {
  plugin.install({ app });
});

useEditorDsl(app, renderDom);
