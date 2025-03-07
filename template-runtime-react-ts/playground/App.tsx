import React, { useContext, useEffect } from 'react';

import type Core from '@tmagic/core';
import type { MPage } from '@tmagic/core';
import { AppContent } from '@tmagic/react-runtime-help';

function App() {
  const app = useContext<Core | undefined>(AppContent);

  if (!app?.page?.data) {
    return null;
  }

  const MagicUiPage = app.resolveComponent('page');

  useEffect(() => {
    const page = document.querySelector(`div[data-tmagic-id=${app.page?.data.id}]`);
    page && window.magic?.onPageElUpdate(page as HTMLElement);
  });

  return <MagicUiPage config={app.page.data as MPage}></MagicUiPage>;
}

export default App;
