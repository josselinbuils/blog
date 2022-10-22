import type { FC } from 'react';
import React from 'react';
import { withCSS } from '../../CSSCollector/withCSS';
import styles, { cssMetadata } from './Hightlight.module.scss';
import { highlightCode } from './highlightCode';

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
