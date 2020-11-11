import path from 'path';
import postcss from 'postcss';
import postcssModulesSync from 'postcss-modules-sync';
import sass from 'sass';
import { generateHash } from '../generateHash';

export function loadSCSSModule(
  file: string
): { id: string; css: string; styles: Record<string, string> } {
  const id = path.relative(process.cwd(), file);
  let styles: Record<string, string> = {};

  let sassResult = sass
    .renderSync({ file })
    .css.toString()
    .replace(/^@charset.+\n/, '');

  const { css } = postcss([
    postcssModulesSync({
      generateScopedName:
        process.env.NODE_ENV === 'production'
          ? '[hash:hex:5]'
          : `[local]_${generateHash(id)}`,
      getJSON(json: Record<string, string>) {
        styles = json;
      },
    }),
  ]).process(sassResult);

  return { id, css: `${css}\n`, styles };
}
