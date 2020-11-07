import postcss from 'postcss';
import postcssModulesSync from 'postcss-modules-sync';
import sass from 'sass';

require.extensions['.scss'] = async (module, file) => {
  let styles: Record<string, string> = {};

  const { css } = postcss([
    postcssModulesSync({
      generateScopedName:
        process.env.NODE_ENV === 'production'
          ? '[hash:hex:5]'
          : '[local]-[hash:hex:5]',
      getJSON(json: Record<string, string>) {
        styles = json;
      },
    }),
  ]).process(sass.renderSync({ file }).css);

  module.exports = styles;
  module.exports.css = `${css}\n`;
};
