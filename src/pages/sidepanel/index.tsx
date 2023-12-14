import React from 'react';
import { createRoot } from 'react-dom/client';

import '@pages/sidepanel/index.css';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import SideNote from '@pages/sidepanel/SideNote';
import SideBlock from '@pages/sidepanel/SideBlock';

refreshOnUpdate('pages/sidepanel');

import {
  createMemoryRouter,
  Link,
  RouterProvider,
} from "react-router-dom";

const router = createMemoryRouter([
  {
    path: "/",
    element: <SideNote />,
  },
  {
    path: "/note/:block_id",
    element: (<SideBlock></SideBlock>),
  },

  {
    path: "/admin",
    element: (<p>Where is the place to add road</p>),
  },
]);


function init() {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }

  const root = createRoot(appContainer);
  root.render(
    <main>
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>
    </main>
);
}

init();
