import type { FC } from 'react';
import React from 'react';
import packageFile from '../../../package.json' assert { type: 'json' };
import type { BlogPost } from '../../BlogPost';
import { withCSS } from '../CSSCollector/withCSS';
import { Markdown } from '../Markdown/Markdown';
import styles, { cssMetadata } from './Post.module.scss';

export const Post: FC<Props> = withCSS(
  ({ post }) => (
    <Markdown className={styles.post} tag="article">{`\
[Posts](/)

${post.content}

## History

${post.history
  .map(
    ({ commitDate, commitHash, commitSubject }) =>
      `- [${commitSubject}](${packageFile.repository}/commit/${commitHash}) committed on ${commitDate}.`,
  )
  .join('\n')}
`}</Markdown>
  ),
  cssMetadata,
);

interface Props {
  post: BlogPost;
}
