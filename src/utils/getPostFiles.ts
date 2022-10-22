import path from 'path';
import { promisify } from 'util';
import baseGlob from 'glob';

const glob = promisify(baseGlob);

export async function getPostFiles(): Promise<string[]> {
  const postsDir = path.join(process.cwd(), 'src/posts');
  return glob(`**/*.md`, { cwd: postsDir, nodir: true });
}
