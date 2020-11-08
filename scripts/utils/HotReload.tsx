import React, { FC } from 'react';

export const HotReload: FC = () => {
  function watchDevServer(): void {
    const socket = new WebSocket(`ws://localhost:3001`);
    let connectionWasLost = false;

    function reload() {
      console.log('Reload...');
      window.location.reload();
    }

    socket.onclose = () => {
      connectionWasLost = true;
      setTimeout(watchDevServer, 3000);
    };
    socket.onerror = socket.onclose as any;
    socket.onmessage = ({ data }) => {
      if (data === 'reload') {
        reload();
      }
    };
    socket.onopen = () => {
      if (connectionWasLost) {
        reload();
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
