import React from 'react';
import { createRoot } from 'react-dom/client';

import Core from '@tmagic/core';
import { DataSourceManager, DeepObservedData } from '@tmagic/data-source';
import { AppContent } from '@tmagic/react-runtime-help';
import type { MApp } from '@tmagic/schema';
import { getUrlParam } from '@tmagic/utils';

import components from '../.tmagic/comp-entry';
import dataSources from '../.tmagic/datasource-entry';
import plugins from '../.tmagic/plugin-entry';

import App from './App';

import '@tmagic/core/resetcss.css';

declare global {
  interface Window {
    magicDSL: MApp[];
    magicPresetComponents: any;
    magicPresetConfigs: any;
    magicPresetValues: any;
  }
}

DataSourceManager.registerObservedData(DeepObservedData);

const getLocalConfig = (): MApp[] => {
  const configStr = localStorage.getItem('magicDSL');
  if (!configStr) return [];
  try {
    // eslint-disable-next-line no-eval
    return [eval(`(${configStr})`)];
  } catch (err) {
    return [];
  }
};

window.magicDSL = [];

Object.entries(dataSources).forEach(([type, ds]: [string, any]) => {
  DataSourceManager.register(type, ds);
});

const app = new Core({
  ua: window.navigator.userAgent,
  config: ((getUrlParam('localPreview') ? getLocalConfig() : window.magicDSL) || [])[0] || {},
  curPage: getUrlParam('page'),
  useMock: Boolean(getUrlParam('useMock')),
});

app.setDesignWidth(app.env.isWeb ? window.document.documentElement.getBoundingClientRect().width : 375);

Object.keys(components).forEach((type: string) => app.registerComponent(type, components[type]));

Object.values(plugins).forEach((plugin: any) => {
  plugin.install({ app });
});

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <AppContent.Provider value={app}>
      <App />
    </AppContent.Provider>
  </React.StrictMode>,
);
