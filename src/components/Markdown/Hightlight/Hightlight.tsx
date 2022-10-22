import type { FC } from 'react';
import React from 'react';
import { withCSS } from '../../CSSCollector/withCSS';
import styles, { cssMetadata } from './Hightlight.module.scss';
import { highlightCode } from './highlightCode';

export const Highlight: FC<Props> = withCSS(
  ({ code, language }) => (
    <code
      className={styles.highlight}
      dangerouslySetInnerHTML={{ __html: highlightCode(code, language) }}
    />
  ),
  cssMetadata
);

interface Props {
  code: string;
  language: string;
}
