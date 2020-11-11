import React, { FC } from 'react';

export const HotReload: FC = () => {
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

            if (styleElement === null) {
              console.error(
                `${LOG_HEADER}reload error: unable to find style with id ${id}`
              );
              return;
            }

            console.log(`${LOG_HEADER}reload ${id}`);
            styleElement.innerHTML = css;

            break;
          }

          case 'reloadPage':
            console.log(`${LOG_HEADER}reload page`);
            window.location.reload();
            break;
        }

        if (data === 'reload') {
          window.location.reload();
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

interface Action {
  type: string;
}

interface MessageAction extends Action {
  type: 'message';
  payload: string;
}

interface ReloadCSSAction extends Action {
  type: 'reloadCSS';
  payload: {
    css: string;
    id: string;
  };
}

interface ReloadPageAction extends Action {
  type: 'reloadPage';
}

export type HotReloadAction =
  | MessageAction
  | ReloadCSSAction
  | ReloadPageAction;
