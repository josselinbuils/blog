import React, { FC } from 'react';
import { BlogPost } from '../BlogPost';
import { Head } from '../components/Head/Head';
import { Page } from '../components/Page/Page';
import { Post } from '../components/Post/Post';
import { getBlogPosts } from '../utils/getBlogPosts';
import { getPostFiles } from '../utils/getPostFiles';
import { getPostSlug } from '../utils/getPostSlug';

interface Props {
  post: BlogPost;
}

const PostPage: FC<Props> = ({ post }) => (
  <Page>
    <Head>
      <title>{post.title}</title>
      <meta name="description" content={post.description} />
    </Head>
    <Post post={post} />
  </Page>
);

export default PostPage;

export async function getPageProps(slug: string): Promise<Props> {
  const post = (await getBlogPosts()).find((post) => post.slug === slug);

  if (post === undefined) {
    throw new Error(`Unable to find post with slug ${slug}`);
  }
  return { post };
}

export async function getPageSlugs(): Promise<string[]> {
  return (await getPostFiles()).map(getPostSlug);
}
