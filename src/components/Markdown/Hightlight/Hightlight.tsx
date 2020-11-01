import React, { FC } from 'react';
import { withCSS } from '../../CSSCollector/withCSS';
import { highlightCode } from './highlightCode/highlightCode';

import { css as darculaCSS } from './highlightCode/darcula.module.scss';
import styles, { css } from './Hightlight.module.scss';

export const Highlight: FC<Props> = withCSS(
  ({ code, language }) => (
    <pre className={styles.highlight}>
      <code
        dangerouslySetInnerHTML={{ __html: highlightCode(code, language) }}
      />
    </pre>
  ),
  `${darculaCSS}${css}`
);

interface Props {
  code: string;
  language: string;
}
