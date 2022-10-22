import path from 'path';
import { promisify } from 'util';
import baseGlob from 'glob';
import paths from '../../paths.json' assert { type: 'json' };
import type { HashedAsset } from './generateHashedAsset';
import { generateHashedAsset } from './generateHashedAsset';

const glob = promisify(baseGlob);
const publicAbsolutePath = path.join(process.cwd(), paths.PUBLIC_DIR);

export async function generateHashedAssets(): Promise<HashedAsset[]> {
  const assetPaths = await glob(`${publicAbsolutePath}/**/*`, {
    absolute: true,
    cwd: '/',
    nodir: true,
  });
  return Promise.all(assetPaths.map(generateHashedAsset));
}
