import React, { useContext } from 'react';

import type TMagicApp from '@tmagic/core';
import { AppContent, useDsl } from '@tmagic/react-runtime-help';

function App() {
  const app = useContext<TMagicApp | undefined>(AppContent);

  const { pageConfig } = useDsl(app);

  const MagicUiPage = app?.resolveComponent('page');

  return <MagicUiPage config={pageConfig}></MagicUiPage>;
}

export default App;
