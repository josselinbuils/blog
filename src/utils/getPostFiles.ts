import path from 'path';
import { glob } from 'glob';

export async function getPostFiles(): Promise<string[]> {
  const postsDir = path.join(process.cwd(), 'src/posts');
  return glob(`**/*.md`, { cwd: postsDir, nodir: true });
}
