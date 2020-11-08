import { promises as fs } from 'fs';
import path from 'path';
import getReadingTime from 'reading-time';
import { BlogPost } from '../BlogPost';
import { getPostHistory } from './getPostHistory';
import { getPostDescription } from './getPostDescription';
import { getPostSlug } from './getPostSlug';
import { getPostTitle } from './getPostTitle';

export async function getBlogPosts(): Promise<BlogPost[]> {
  const postsDir = path.join(process.cwd(), 'src/posts');
  const postFiles = await fs.readdir(postsDir);

  return Promise.all(
    postFiles.map(async (filename) => {
      const content = await fs.readFile(path.join(postsDir, filename), 'utf8');
      const description = getPostDescription(content);
      const history = getPostHistory(filename);
      const readingTime = getReadingTime(content).text;
      const slug = getPostSlug(filename);
      const title = getPostTitle(content);

      return { content, description, history, readingTime, slug, title };
    })
  );
}
