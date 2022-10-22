import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import url, { URL } from 'node:url';
import typescript from 'typescript';
import { existsSync } from 'node:fs';

const baseUrl = url.pathToFileURL(`${process.cwd()}/`).href;
const extensionsRegex = /\.tsx?$/;
let tsConfig;

export async function resolve(specifier, context, nextResolve) {
  const { parentURL = baseUrl } = context;

  if (extensionsRegex.test(specifier)) {
    return {
      shortCircuit: true,
      url: new URL(specifier, parentURL).href,
    };
  }

  let filePath = specifier.startsWith('file:')
    ? url.fileURLToPath(specifier)
    : specifier;

  if (path.extname('filePath') === '') {
    if (parentURL) {
      filePath = path.join(
        path.dirname(url.fileURLToPath(parentURL)),
        filePath
      );
    }

    if (existsSync(`${filePath}.ts`)) {
      return {
        shortCircuit: true,
        url: url.pathToFileURL(`${filePath}.ts`).href,
      };
    }

    if (existsSync(`${filePath}.tsx`)) {
      return {
        shortCircuit: true,
        url: url.pathToFileURL(`${filePath}.tsx`).href,
      };
    }
  }
  return nextResolve(specifier, context);
}

export async function load(specifier, context, nextLoad) {
  if (
    specifier.startsWith('file:') &&
    extensionsRegex.test(url.fileURLToPath(specifier))
  ) {
    const format = 'module';
    const rawSource = await fs.readFile(url.fileURLToPath(specifier), 'utf8');

    if (!tsConfig) {
      tsConfig = JSON.parse(
        await fs.readFile(path.join(process.cwd(), 'tsconfig.json'), 'utf8')
      );
    }

    let outputText;

    try {
      ({ outputText } = typescript.transpileModule(rawSource, {
        compilerOptions: tsConfig.compilerOptions,
        fileName: url.fileURLToPath(specifier),
      }));
    } catch (error) {
      throw new Error(`Unable to transpile "${specifier}": ${error.stack}`);
    }

    return {
      format,
      shortCircuit: true,
      source: outputText,
    };
  }
  return nextLoad(specifier, context);
}
