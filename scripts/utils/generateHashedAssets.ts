import path from 'path';
import baseGlob from 'glob';
import { promisify } from 'util';
import { PUBLIC_DIR } from '../constants';
import { generateHashedAsset, HashedAsset } from './generateHashedAsset';

const glob = promisify(baseGlob);
const publicAbsolutePath = path.join(process.cwd(), PUBLIC_DIR);

export async function generateHashedAssets(): Promise<HashedAsset[]> {
  const assetPaths = await glob(`${publicAbsolutePath}/**/*`, {
    absolute: true,
    cwd: '/',
    nodir: true,
  });
  return Promise.all(assetPaths.map(generateHashedAsset));
}
