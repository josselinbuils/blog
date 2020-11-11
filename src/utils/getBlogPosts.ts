import baseGlob from 'glob';
import path from 'path';
import getReadingTime from 'reading-time';
import { loadMarkdown } from '../../scripts/utils/loaders/loadMarkdown';
import { BlogPost } from '../BlogPost';
import { getPostHistory } from './getPostHistory';
import { getPostDescription } from './getPostDescription';
import { getPostSlug } from './getPostSlug';
import { getPostTitle } from './getPostTitle';
import { promisify } from 'util';

const glob = promisify(baseGlob);

export async function getBlogPosts(): Promise<BlogPost[]> {
  const postsDir = path.join(process.cwd(), 'src/posts');
  const postFiles = await glob(`**/*.md`, {
    cwd: postsDir,
    nodir: true,
  });

  return Promise.all(
    postFiles.map(async (filename) => {
      const content = await loadMarkdown(path.join(postsDir, filename));
      const description = getPostDescription(content);
      const history = getPostHistory(filename);
      const readingTime = getReadingTime(content).text;
      const slug = getPostSlug(filename);
      const title = getPostTitle(content);

      return { content, description, history, readingTime, slug, title };
    })
  );
}
