import React, { FC } from 'react';
import { BlogPost } from '../../BlogPost';
import { withCSS } from '../CSSCollector/withCSS';
import { Markdown } from '../Markdown/Markdown';

import styles, { css } from './Posts.module.scss';

export const Posts: FC<Props> = withCSS(
  ({ posts }) => (
    <Markdown className={styles.posts}>{`\
# Opinionated

Hey, I'm Josselin, a full-stack JavaScript developer 😄

Here are some posts where I give my opinion on code stuff 👨‍💻

[![{ "alt": "LinkedIn", "height": 40, "width": 40 }](/linkedin.svg)](https://www.linkedin.com/in/josselinbuils)
[![{ "alt": "Twitter", "height": 40, "width": 40 }](/twitter.svg)](https://twitter.com/josselinbuils)
[![{ "alt": "Twitter", "height": 40, "width": 40 }](/github.svg)](https://github.com/josselinbuils)

${posts
  .map(
    ({ history, readingTime, slug, title }) => `\
## [${title}](/${slug})
  ${history.pop()?.commitDate} - ${readingTime}
`
  )
  .join('')}
`}</Markdown>
  ),
  css
);

interface Props {
  posts: BlogPost[];
}
