import type { FC } from 'react';
import React from 'react';
import type { BlogPost } from '../BlogPost';
import { Page } from '../components/Page/Page';
import { Post } from '../components/Post/Post';
import { getBlogPosts } from '../utils/getBlogPosts';
import { getPostFiles } from '../utils/getPostFiles';
import { getPostSlug } from '../utils/getPostSlug';

interface Props {
  post: BlogPost;
}

const PostPage: FC<Props> = ({ post }) => (
  <Page description={post.description} title={post.title}>
    <Post post={post} />
  </Page>
);

export default PostPage;

export async function getPageProps(slug: string): Promise<Props> {
  const post = (await getBlogPosts()).find((p) => p.slug === slug);

  if (post === undefined) {
    throw new Error(`Unable to find post with slug ${slug}`);
  }
  return { post };
}

export async function getPageSlugs(): Promise<string[]> {
  return (await getPostFiles()).map(getPostSlug);
}
