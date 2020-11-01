import React, { FC } from 'react';
import { BlogPost } from '../BlogPost';
import { Head } from '../components/Head/Head';
import { Page } from '../components/Page';
import { Post } from '../components/Post/Post';

export const PostPage: FC<Props> = ({ post }) => (
  <Page>
    <Head>
      <title>{post.title}</title>
      <meta name="description" content={post.description} />
      <link
        rel="preload"
        href="/JetBrainsMono-Regular.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
    </Head>
    <Post post={post} />
  </Page>
);

interface Props {
  post: BlogPost;
}
