import { loadSCSSModule } from './loadSCSSModule';

require.extensions['.scss'] = (module, file) => {
  const { css, id, styles } = loadSCSSModule(file);
  module.exports = styles;
  module.exports.cssMetadata = { css, id };
};
