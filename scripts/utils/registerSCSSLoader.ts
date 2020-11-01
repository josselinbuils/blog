import postcss from 'postcss';
import postcssModulesSync from 'postcss-modules-sync';
import sass from 'sass';

require.extensions['.scss'] = async (module, file) => {
  let styles: Record<string, string> = {};

  const { css } = postcss([
    postcssModulesSync({
      getJSON(json: Record<string, string>) {
        styles = json;
      },
    }),
  ]).process(sass.renderSync({ file }).css);

  module.exports = styles;
  module.exports.css = `${css}\n\n`;
};
