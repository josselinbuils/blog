import path from 'path';
import fs from 'fs-extra';
import { DIST_DIR, PUBLIC_DIR } from '../constants';
import { generateHash } from './generateHash';

const distAbsolutePath = path.join(process.cwd(), DIST_DIR);
const publicAbsolutePath = path.join(process.cwd(), PUBLIC_DIR);

export interface HashedAsset {
  toRelativeURL: string;
  fromRelativeURL: string;
}

export async function generateHashedAsset(
  absolutePath: string
): Promise<HashedAsset> {
  const extension = path.extname(absolutePath);
  const relativePath = path.relative(publicAbsolutePath, absolutePath);
  const fromRelativeURL = `/${relativePath}`;
  const hash = generateHash(await fs.readFile(absolutePath));
  const newAbsolutePath = path.join(
    distAbsolutePath,
    `assets/${relativePath.slice(0, -extension.length)}.${hash}${extension}`
  );
  const toRelativeURL = `/${path.relative(distAbsolutePath, newAbsolutePath)}`;

  await fs.copy(absolutePath, newAbsolutePath);

  return { fromRelativeURL, toRelativeURL };
}
