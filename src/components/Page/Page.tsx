import React, { FC } from 'react';
import ReactDOMServer from 'react-dom/server';
import { CSSCollector } from '../CSSCollector/CSSCollector';
import { HeadCollector } from '../Head/HeadCollector';

import styles, { css } from './Page.module.scss';

export const Page: FC = ({ children }) => {
  const headCollector = new HeadCollector();
  const cssCollector = new CSSCollector();
  cssCollector.add(css);
  const body = ReactDOMServer.renderToStaticMarkup(
    headCollector.collect(cssCollector.collect(children))
  );
  const style = cssCollector.retrieve();
  const head = headCollector.retrieve();

  return (
    <>
      <html className={styles.html} lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {head}
          <style dangerouslySetInnerHTML={{ __html: style }} />
        </head>
        <body
          className={styles.body}
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </html>
    </>
  );
};
