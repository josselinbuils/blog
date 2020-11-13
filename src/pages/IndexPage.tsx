import React, { FC } from 'react';
import { BlogPost } from '../BlogPost';
import { Head } from '../components/Head/Head';
import { Page } from '../components/Page/Page';
import { Posts } from '../components/Posts/Posts';
import { getBlogPosts } from '../utils/getBlogPosts';

interface Props {
  posts: BlogPost[];
}

const IndexPage: FC<Props> = ({ posts }) => (
  <Page>
    <Head>
      <title>Blog</title>
      <meta
        name="description"
        content="Hey, I'm Josselin, a full-stack JavaScript developer 😄 Here are some posts where I give my opinion on code stuff 👨‍💻"
      />
    </Head>
    <Posts posts={posts} />
  </Page>
);

export default IndexPage;

export async function getPageProps(): Promise<Props> {
  const posts = await getBlogPosts();
  return { posts };
}

export async function getPageSlugs(): Promise<string[]> {
  return ['index'];
}
