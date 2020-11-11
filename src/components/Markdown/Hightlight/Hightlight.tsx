import React, { FC } from 'react';
import { withCSS } from '../../CSSCollector/withCSS';
import { highlightCode } from './highlightCode';

import styles, { cssMetadata } from './Hightlight.module.scss';

export const Highlight: FC<Props> = withCSS(
  ({ code, language }) => (
    <pre className={styles.highlight}>
      <code
        dangerouslySetInnerHTML={{ __html: highlightCode(code, language) }}
      />
    </pre>
  ),
  cssMetadata
);

interface Props {
  code: string;
  language: string;
}
