import path from 'path';
import fs from 'fs-extra';
import { DIST_ASSETS_DIR, DIST_DIR } from '../../constants';
import { generateHash } from '../generateHash';

export async function loadFile(filePath: string): Promise<string> {
  const basename = path.basename(filePath);
  const extension = path.extname(filePath);
  const content = await fs.readFile(filePath);
  const hash = generateHash(content);
  const distPath = path.join(
    process.cwd(),
    DIST_ASSETS_DIR,
    `${basename.slice(0, -extension.length)}.${hash}${extension}`
  );

  await fs.copy(filePath, distPath);

  return `/${path.relative(path.join(process.cwd(), DIST_DIR), distPath)}`;
}
