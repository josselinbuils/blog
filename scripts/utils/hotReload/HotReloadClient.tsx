import React, { FC } from 'react';
import { HotReloadAction } from './HotReloadAction';

export const HotReloadClient: FC = () => {
  function watchDevServer(): void {
    const LOG_HEADER = 'Hot reload: ';
    const socket = new WebSocket(`ws://localhost:3001`);

    socket.onmessage = ({ data }) => {
      try {
        const action = JSON.parse(data) as HotReloadAction;

        switch (action.type) {
          case 'message':
            console.log(`${LOG_HEADER}${action.payload}`);
            break;

          case 'reloadCSS': {
            const { css, id } = action.payload;
            const styleElement = document.getElementById(id);

            if (styleElement !== null) {
              console.log(`${LOG_HEADER}reload ${id}`);
              styleElement.innerHTML = css;
            }
            break;
          }

          case 'reloadPage': {
            const { pathname } = action.payload;

            if (window.location.pathname === pathname) {
              console.log(`${LOG_HEADER}reload page`);
              window.location.reload();
            }
            break;
          }
        }
      } catch (error) {
        console.error(`${LOG_HEADER}parsing error:`, error);
      }
    };
  }

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.watchDevServer = ${watchDevServer.toString()};  window.watchDevServer();`,
      }}
    />
  );
};
