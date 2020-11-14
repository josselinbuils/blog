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

  const assets = await generateHashedAssets();

  await Promise.all([
    (await getPages()).map(({ content, slug }) =>
      fs.outputFile(
        path.join(distAbsolutePath, `${slug}.html`),
        renderPage(content, assets),
        'utf8'
      )
    ),
  ]);
})();

process.on('unhandledRejection', (error) => {
  console.error(error);
  process.exit(1);
});
