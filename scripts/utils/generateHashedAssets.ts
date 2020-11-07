import path from 'path';
import fs from 'fs-extra';
import baseGlob from 'glob';
import crypto from 'crypto';
import { promisify } from 'util';

const glob = promisify(baseGlob);

export async function generateHashedAssets(
  publicAbsolutePath: string,
  distAbsolutePath: string
): Promise<{ newRelativeURL: string; relativeURL: string }[]> {
  const assetPaths = await glob(`${publicAbsolutePath}/**/*`, {
    absolute: true,
    cwd: '/',
    nodir: true,
  });

  return Promise.all(
    assetPaths.map(async (absolutePath) => {
      const extension = path.extname(absolutePath);
      const relativePath = path.relative(publicAbsolutePath, absolutePath);
      const relativeURL = `/${relativePath}`;
      const content = await fs.readFile(absolutePath);
      const hash = crypto
        .createHash('md5')
        .update(content)
        .digest('hex')
        .slice(0, 8);
      const newAbsolutePath = path.join(
        distAbsolutePath,
        `assets/${relativePath.slice(0, -extension.length)}.${hash}${extension}`
      );
      const newRelativeURL = `/${path.relative(
        distAbsolutePath,
        newAbsolutePath
      )}`;

      await fs.copy(absolutePath, newAbsolutePath);

      return { newRelativeURL, relativeURL };
    })
  );
}
