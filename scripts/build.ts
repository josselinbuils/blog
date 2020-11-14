require('./utils/loaders/registerSCSSModuleLoaders');

import fs from 'fs-extra';
import path from 'path';
import { DIST_DIR } from './constants';
import { generateHashedAssets } from './utils/generateHashedAssets';
import { getPages } from './utils/getPages';
import { renderPage } from './utils/renderPage';

(async () => {
  const distAbsolutePath = path.join(process.cwd(), DIST_DIR);

  await fs.emptyDirSync(distAbsolutePath);

  const [assets, pages] = await Promise.all([
    generateHashedAssets(),
    getPages(),
  ]);

  await Promise.all([
    pages.map(async ({ factory, slug }) =>
      fs.outputFile(
        path.join(distAbsolutePath, `${slug || 'index'}.html`),
        renderPage(await factory(), assets),
        'utf8'
      )
    ),
  ]);
})();

process.on('unhandledRejection', (error) => {
  console.error(error);
  process.exit(1);
});
