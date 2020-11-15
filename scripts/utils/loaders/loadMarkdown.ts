import { promises as fs } from 'fs';
import path from 'path';
import { loadFile } from './loadFile';

export async function loadMarkdown(filePath: string): Promise<string> {
  let content = await fs.readFile(filePath, 'utf8');
  const imageMatches = [...content.matchAll(/!\[[^\]]+]\(([^)]+)\)/g)];

  await Promise.all(
    imageMatches.map(async ([image, src]) => {
      const newSrc = await loadFile(path.join(path.dirname(filePath), src));
      const newImage = image.replace(new RegExp(src), newSrc);
      content = content.replace(image, newImage);
    })
  );
  return content;
}
