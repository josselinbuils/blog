import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import url, { URL } from 'node:url';
import { generateHash } from './utils/generateHash.mjs';
import paths from '../paths.json' assert { type: 'json' };

const baseUrl = url.pathToFileURL(`${process.cwd()}/`).href;
const extensionsRegex = /\.md$/;

export async function resolve(specifier, context, nextResolve) {
  const { parentURL = baseUrl } = context;

  if (extensionsRegex.test(specifier)) {
    return {
      shortCircuit: true,
      url: new URL(specifier, parentURL).href,
    };
  }
  return nextResolve(specifier, context);
}

export async function load(specifier, context, nextLoad) {
  if (
    specifier.startsWith('file:') &&
    extensionsRegex.test(url.fileURLToPath(specifier))
  ) {
    const filePath = url.fileURLToPath(specifier);
    const format = 'module';
    let markdown = await fs.readFile(filePath, 'utf8');
    const imageMatches = [...markdown.matchAll(/!\[[^\]]+]\(([^)]+)\)/g)];

    await Promise.all(
      imageMatches.map(async ([image, src]) => {
        const newSrc = await loadFile(path.join(path.dirname(filePath), src));
        const newImage = image.replace(new RegExp(src), newSrc);
        markdown = markdown.replace(image, newImage);
      }),
    );

    return {
      format,
      shortCircuit: true,
      source: `export const content = \`${markdown.replaceAll(
        '`',
        '\\`',
      )}\`;\n`,
    };
  }
  return nextLoad(specifier, context);
}

async function loadFile(filePath) {
  const basename = path.basename(filePath);
  const extension = path.extname(filePath);
  const content = await fs.readFile(filePath);
  const hash = generateHash(content);
  const distPath = path.join(
    process.cwd(),
    paths.DIST_ASSETS_DIR,
    `${basename.slice(0, -extension.length)}.${hash}${extension}`,
  );

  await fs.copyFile(filePath, distPath);

  return `/${path.relative(
    path.join(process.cwd(), paths.DIST_DIR),
    distPath,
  )}`;
}
