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
import StorageModel from './storge_model';
import withErrorBoundary from '@root/src/shared/hoc/withErrorBoundary';
import withSuspense from '@root/src/shared/hoc/withSuspense';
import { AccountPage } from './account/AccountPage';

const createRouter = function (storage: StorageModel) {  
  return createMemoryRouter([
    {
      path: "/",
      element: <SideNote storage={storage}/>,
    },

    {
      path: "/note/:page_id",
      element: <SideBlock storage={storage} />,
    },

    {
      path: "/account",
      element: <AccountPage storage={storage}></AccountPage>,
    },
  ]);
}; 


function init() {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }

  const storageModel = new StorageModel();
  const router = createRouter(storageModel);

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

chrome.runtime.onConnect.addListener(function(port) {

});
