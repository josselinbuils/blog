import React, { FC } from 'react';

export const HotReload: FC = () => {
  function watchDevServer(): void {
    const socket = new WebSocket(`ws://localhost:3001`);

    socket.onmessage = ({ data }) => {
      console.log(`Hot reload: ${data}`);
      if (data === 'reload') {
        window.location.reload();
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