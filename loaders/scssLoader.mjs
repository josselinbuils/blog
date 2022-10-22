import path from 'node:path';
import process from 'node:process';
import url, { URL } from 'node:url';
import postcss from 'postcss';
import postcssModules from 'postcss-modules';
import sass from 'sass';
import { generateHash } from './utils/generateHash.mjs';

const baseURL = url.pathToFileURL(`${process.cwd()}/`).href;
const extensionsRegex = /\.scss$/;

export async function resolve(specifier, context, nextResolve) {
  if (extensionsRegex.test(specifier)) {
    const { parentURL = baseURL } = context;

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
    const format = 'module';
    const { css, id, styles } = await loadSCSSModule(
      url.fileURLToPath(specifier)
    );
    const source = `\
export default ${JSON.stringify(styles)};
export const cssMetadata = { css: \`${css}\`, id: "${id}" };
`;

    return {
      format,
      shortCircuit: true,
      source,
    };
  }
  return nextLoad(specifier, context);
}

async function loadSCSSModule(file) {
  const id = path.relative(process.cwd(), file);
  let styles = {};

  const sassResult = await new Promise((resolve, reject) => {
    sass.render({ file }, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result.css.toString().replace(/^@charset.+\n/, ''));
      }
    });
  });

  const { css } = await postcss([
    postcssModules({
      generateScopedName:
        process.env.NODE_ENV === 'production'
          ? '[hash:hex:5]'
          : `[local]_${generateHash(id)}`,
      getJSON(_, json) {
        styles = json;
      },
    }),
  ]).process(sassResult, { from: undefined });

  return { id, css: `${css}\n`, styles };
}
