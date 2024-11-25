import type { MApp } from '@tmagic/core';

export const getLocalConfig = (): MApp[] => {
  const configStr = localStorage.getItem('magicDSL');
  if (!configStr) return [];
  try {
    // eslint-disable-next-line no-eval
    return [eval(`(${configStr})`)];
  } catch (err) {
    return [];
  }
};
