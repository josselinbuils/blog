import path from 'path';
import fs from 'fs-extra';
import paths from '../paths.json' assert { type: 'json' };
import { generateHashedAssets } from './utils/generateHashedAssets';
import { getPages } from './utils/getPages';
import { renderPage } from './utils/renderPage';

(async () => {
  const distAbsolutePath = path.join(process.cwd(), paths.DIST_DIR);

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
        'utf8',
      ),
    ),
  ]);
})();

process.on('unhandledRejection', (error) => {
  console.error(error);
  process.exit(1);
});
