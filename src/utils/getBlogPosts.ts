import path from 'path';
import getReadingTime from 'reading-time';
import type { BlogPost } from '../BlogPost';
import { getPostDescription } from './getPostDescription';
import { getPostFiles } from './getPostFiles';
import { getPostHistory } from './getPostHistory';
import { getPostSlug } from './getPostSlug';
import { getPostTitle } from './getPostTitle';

const postsDir = path.join(process.cwd(), 'src/posts');
let postsPromise: Promise<BlogPost[]>;

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (postsPromise === undefined || process.env.NODE_ENV === 'development') {
    postsPromise = getPostFiles().then((files) =>
      Promise.all(
        files.map(async (filename) => {
          const { content } = await import(path.join(postsDir, filename));
          const description = getPostDescription(content);
          const history = getPostHistory(filename);
          const readingTime = getReadingTime(content).text;
          const slug = getPostSlug(filename);
          const title = getPostTitle(content);

          return { content, description, history, readingTime, slug, title };
        }),
      ),
    );
  }
  return postsPromise;
}
