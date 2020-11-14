import React, { ReactNode } from 'react';
import { minify } from 'html-minifier';
import ReactDOMServer from 'react-dom/server';
import { HashedAsset } from './generateHashedAssets';
import { HotReload } from './HotReload';

export function renderPage(content: ReactNode, assets: HashedAsset[]): string {
  const rendered = assets.reduce(
    (markup, { fromRelativeURL, toRelativeURL }) =>
      markup.replace(new RegExp(fromRelativeURL, 'g'), toRelativeURL),
    `<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(
      <>
        {process.env.NODE_ENV === 'development' && <HotReload />}
        {content}
      </>
    )}`
  );

  return process.env.NODE_ENV === 'production'
    ? minify(rendered, {
        collapseWhitespace: true,
        minifyCSS: true,
      })
    : rendered;
}
