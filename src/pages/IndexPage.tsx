import React, { FC } from 'react';
import { BlogPost } from '../BlogPost';
import { Head } from '../components/Head/Head';
import { Page } from '../components/Page/Page';
import { Posts } from '../components/Posts/Posts';

export const IndexPage: FC<Props> = ({ posts }) => (
  <Page>
    <Head>
      <title>Opinionated</title>
      <meta
        name="description"
        content="Hey, I'm Josselin, a full-stack JavaScript developer 😄 Here are some posts where I give my opinion on code stuff 👨‍💻"
      />
    </Head>
    <Posts posts={posts} />
  </Page>
);

interface Props {
  posts: BlogPost[];
}
