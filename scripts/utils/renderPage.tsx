import { minify } from 'html-minifier';
import type { ReactNode } from 'react';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import type { HashedAsset } from './generateHashedAsset';
import { HotReloadClient } from './hotReload/HotReloadClient';

export function renderPage(content: ReactNode, assets: HashedAsset[]): string {
  const rendered = assets.reduce(
    (markup, { fromRelativeURL, toRelativeURL }) =>
      markup.replace(new RegExp(fromRelativeURL, 'g'), toRelativeURL),
    `<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(
      <>
        {process.env.NODE_ENV === 'development' && <HotReloadClient />}
        {content}
      </>,
    )}`,
  );

  return process.env.NODE_ENV === 'production'
    ? minify(rendered, {
        collapseWhitespace: true,
        minifyCSS: true,
      })
    : rendered;
}
