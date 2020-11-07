require('./utils/registerSCSSLoader');

import fs from 'fs-extra';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { IndexPage } from '../src/pages/IndexPage';
import { PostPage } from '../src/pages/PostPage';
import { getBlogPosts } from '../src/utils/getBlogPosts';

// TODO add hashes to files and add cache

(async () => {
  const distFolder = path.join(process.cwd(), 'dist');
  const posts = await getBlogPosts();

  await fs.emptyDirSync(distFolder);

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

  const writePromises = pages.map(({ name, content }) =>
    fs.outputFile(
      path.join(distFolder, `${name}.html`),
      ReactDOMServer.renderToStaticMarkup(content),
      'utf8'
    )
  );

  await Promise.all([writePromises]);
})();

process.on('unhandledRejection', (error) => {
  console.error(error);
  process.exit(1);
});
