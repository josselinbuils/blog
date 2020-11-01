import React, { FC } from 'react';
import ReactDOMServer from 'react-dom/server';
import { CSSCollector } from './CSSCollector/CSSCollector';
import { HeadCollector } from './Head/HeadCollector';

export const Page: FC = ({ children }) => {
  const headCollector = new HeadCollector();
  const cssCollector = new CSSCollector();
  const body = ReactDOMServer.renderToStaticMarkup(
    headCollector.collect(cssCollector.collect(children))
  );
  const css = cssCollector.retrieve();
  const head = headCollector.retrieve();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        {head}
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body dangerouslySetInnerHTML={{ __html: body }} />
    </html>
  );
};
