import React, { FC } from 'react';
import { repository } from '../../../package.json';
import { BlogPost } from '../../BlogPost';
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
  .map(({ commitDate, commitHash, commitSubject }) => {
    return `- [${commitSubject}](${repository}/commit/${commitHash}) committed on ${commitDate}.`;
  })
  .join('\n')}
`}</Markdown>
  ),
  cssMetadata
);

interface Props {
  post: BlogPost;
}
