import path from 'path';
import fs from 'fs-extra';
import baseGlob from 'glob';
import { promisify } from 'util';
import { DIST_DIR, PUBLIC_DIR } from '../constants';
import { generateHash } from './generateHash';

const glob = promisify(baseGlob);
const distAbsolutePath = path.join(process.cwd(), DIST_DIR);
const publicAbsolutePath = path.join(process.cwd(), PUBLIC_DIR);

export interface HashedAsset {
  toRelativeURL: string;
  fromRelativeURL: string;
}

export async function generateHashedAssets(): Promise<HashedAsset[]> {
  const assetPaths = await glob(`${publicAbsolutePath}/**/*`, {
    absolute: true,
    cwd: '/',
    nodir: true,
  });

  return Promise.all(
    assetPaths.map(async (absolutePath) => {
      const extension = path.extname(absolutePath);
      const relativePath = path.relative(publicAbsolutePath, absolutePath);
      const fromRelativeURL = `/${relativePath}`;
      const hash = generateHash(await fs.readFile(absolutePath));
      const newAbsolutePath = path.join(
        distAbsolutePath,
        `assets/${relativePath.slice(0, -extension.length)}.${hash}${extension}`
      );
      const toRelativeURL = `/${path.relative(
        distAbsolutePath,
        newAbsolutePath
      )}`;

      await fs.copy(absolutePath, newAbsolutePath);

      return { fromRelativeURL, toRelativeURL };
    })
  );
}
