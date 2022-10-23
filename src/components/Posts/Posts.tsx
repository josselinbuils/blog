import type { FC } from 'react';
import React from 'react';
import type { BlogPost } from '../../BlogPost';
import { withCSS } from '../CSSCollector/withCSS';
import { Markdown } from '../Markdown/Markdown';
import styles, { cssMetadata } from './Posts.module.scss';

interface Props {
  posts: BlogPost[];
}

export const Posts: FC<Props> = withCSS(
  ({ posts }) => (
    <Markdown className={styles.posts} tag="main">{`\
# Blog

Hey, I'm Josselin, a full-stack JavaScript developer 😄

Here are some posts where I give my opinion on code stuff 👨‍💻

[![{ "alt": "LinkedIn", "height": 40, "width": 40 }](/linkedin.svg)](https://www.linkedin.com/in/josselinbuils)
[![{ "alt": "Twitter", "height": 40, "width": 40 }](/twitter.svg)](https://twitter.com/josselinbuils)
[![{ "alt": "Twitter", "height": 40, "width": 40 }](/github.svg)](https://github.com/josselinbuils)

## Posts

${posts
  .map(
    ({ history, readingTime, slug, title }) => `\
### [${title}](/${slug})
  ${[...history].pop()?.commitDate} - ${readingTime}
`
  )
  .join('')}
`}</Markdown>
  ),
  cssMetadata
);
