import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { FC } from 'react';
import { repository } from '../../../package.json';
import { BlogPost } from '../../BlogPost';
import { withCSS } from '../CSSCollector/withCSS';
import { Markdown } from '../Markdown/Markdown';

import styles, { css } from './Post.module.scss';

dayjs.extend(relativeTime);

export const Post: FC<Props> = withCSS(
  ({ post }) => (
    <Markdown className={styles.post} tag="article">{`\
[◀️ Posts](/)

${post.content}

## History

${post.history
  .map(({ commitHash, commitSubject, commitTimestamp }) => {
    const date = dayjs(commitTimestamp).format('MMM D, YYYY');
    return `- [${commitSubject}](${repository}/commit/${commitHash}) committed on ${date}.`;
  })
  .join('\n')}
`}</Markdown>
  ),
  css
);

interface Props {
  post: BlogPost;
}
