require('./utils/loaders/registerSCSSModuleLoaders');

import fs from 'fs-extra';
import { minify } from 'html-minifier';
import path from 'path';
import React, { ReactNode } from 'react';
import ReactDOMServer from 'react-dom/server';
import { DIST_DIR, PUBLIC_DIR } from './constants';
import { generateHashedAssets } from './utils/generateHashedAssets';
import { getPages } from './utils/getPages';
import { HotReload } from './utils/HotReload';

(async () => {
  const distAbsolutePath = path.join(process.cwd(), DIST_DIR);
  const publicAbsolutePath = path.join(process.cwd(), PUBLIC_DIR);

  await fs.emptyDirSync(distAbsolutePath);

  const assets = await generateHashedAssets(
    publicAbsolutePath,
    distAbsolutePath
  );

  function renderFile(content: ReactNode): string {
    const rendered = assets.reduce(
      (markup, { newRelativeURL, relativeURL }) =>
        markup.replace(new RegExp(relativeURL, 'g'), newRelativeURL),
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

  await Promise.all([
    (await getPages()).map(({ content, slug }) =>
      fs.outputFile(
        path.join(distAbsolutePath, `${slug}.html`),
        renderFile(content),
        'utf8'
      )
    ),
  ]);
})();

process.on('unhandledRejection', (error) => {
  console.error(error);
  process.exit(1);
});
