import path from 'node:path';
import process from 'node:process';
import url, { URL } from 'node:url';
import paths from '../paths.json' assert { type: 'json' };

const sourceDirPath = path.join(process.cwd(), paths.SRC_DIR);
const dependencyMap = new Map();
const pathsToClear = new Set();
const overrides = new Map();

global.addFileParent = addFileParent;
global.clearFileCache = clearFileCache;

export async function resolve(specifier, context, nextResolve) {
  const result = await nextResolve(specifier, context);
  const resultUrl = new URL(result.url);

  if (resultUrl.protocol === 'file:') {
    const filePath = url.fileURLToPath(resultUrl);

    if (context.parentURL) {
      const parentPath = url.fileURLToPath(context.parentURL);
      addFileParent(filePath, parentPath);
    }

    if (pathsToClear.has(filePath)) {
      const url =
        resultUrl.href + '?id=' + Math.random().toString(36).substring(3);

      console.log(`Reload ${path.relative(process.cwd(), filePath)}`);
      pathsToClear.delete(filePath);
      overrides.set(result.url, url);

      return { url };
    }
    if (overrides.has(result.url)) {
      return { url: overrides.get(result.url) };
    }
  }

  return result;
}

function addFileParent(filePath, parentPath) {
  if (filePath.startsWith(sourceDirPath)) {
    if (!dependencyMap.has(filePath)) {
      dependencyMap.set(filePath, []);
    }
    const fileParents = dependencyMap.get(filePath);

    if (!fileParents.includes(parentPath)) {
      fileParents.push(parentPath);
    }
  }
}

function clearFileCache(absolutePath) {
  pathsToClear.add(absolutePath);
  getParents(absolutePath).forEach((file) => pathsToClear.add(file));
}

function getParents(file) {
  const parents = dependencyMap.get(file);
  return parents ? [parents, parents.map(getParents)].flat(Infinity) : [];
}
