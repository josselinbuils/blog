import { generateHashedAssets } from './utils/generateHashedAssets';

require('./utils/registerSCSSLoader');

import fs from 'fs-extra';
import { minify } from 'html-minifier';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { IndexPage } from '../src/pages/IndexPage';
import { PostPage } from '../src/pages/PostPage';
import { getBlogPosts } from '../src/utils/getBlogPosts';

const DIST_DIR = 'dist';
const PUBLIC_DIR = 'public';

(async () => {
  const distAbsolutePath = path.join(process.cwd(), DIST_DIR);
  const publicAbsolutePath = path.join(process.cwd(), PUBLIC_DIR);
  const posts = await getBlogPosts();

  await fs.emptyDirSync(distAbsolutePath);

  const assets = await generateHashedAssets(
    publicAbsolutePath,
    distAbsolutePath
  );

  const pages = [
    {
      name: 'index',
      content: <IndexPage posts={posts} />,
    },
    ...posts.map((post) => ({
      name: post.slug,
      content: <PostPage post={post} />,
    })),
  ];

  function renderFile(content: JSX.Element): string {
    return minify(
      assets.reduce(
        (markup, { newRelativeURL, relativeURL }) =>
          markup.replace(new RegExp(relativeURL, 'g'), newRelativeURL),
        `<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(content)}`
      ),
      {
        collapseWhitespace: true,
        minifyCSS: true,
      }
    );
  }

  await Promise.all([
    pages.map(({ name, content }) =>
      fs.outputFile(
        path.join(distAbsolutePath, `${name}.html`),
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
