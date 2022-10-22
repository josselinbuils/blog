import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'fs-extra';
import paths from '../../paths.json' assert { type: 'json' };

const distAbsolutePath = path.join(process.cwd(), paths.DIST_DIR);
const publicAbsolutePath = path.join(process.cwd(), paths.PUBLIC_DIR);

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

function generateHash(data: string | NodeJS.ArrayBufferView): string {
  return crypto.createHash('md5').update(data).digest('hex').slice(0, 5);
}
