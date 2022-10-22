import type { FC } from 'react';
import React from 'react';
import type { HotReloadAction } from './HotReloadAction';

export const HotReloadClient: FC = () => {
  function watchDevServer(): void {
    const LOG_HEADER = 'Hot reload: ';
    const socket = new WebSocket(`ws://localhost:3001`);

    socket.onopen = () =>
      socket.send(
        JSON.stringify({
          type: 'setClientPathname',
          payload: { pathname: window.location.pathname },
        } as HotReloadAction)
      );

    socket.onmessage = ({ data }) => {
      try {
        const action = JSON.parse(data) as HotReloadAction;

        switch (action.type) {
          case 'message':
            console.log(`${LOG_HEADER}${action.payload}`);
            break;

          case 'reloadPage': {
            const { pathname } = action.payload;

            if (window.location.pathname === pathname) {
              console.log(`${LOG_HEADER}reload page`);
              window.location.reload();
            }
            break;
          }

          default:
            console.log(`${LOG_HEADER}Unknown action received: ${action.type}`);
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
