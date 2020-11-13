import baseGlob from 'glob';
import path from 'path';
import React, { ReactNode } from 'react';
import { promisify } from 'util';

const glob = promisify(baseGlob);
const pagesDir = path.join(process.cwd(), 'src/pages');

interface Page {
  content: ReactNode;
  slug: string;
}

export async function getPages(): Promise<Page[]> {
  const pageFiles = await glob(`*.tsx`, {
    absolute: true,
    cwd: pagesDir,
    nodir: true,
  });
  const pages = [] as Page[];

  for (const filename of pageFiles) {
    const { default: Component, getPageProps, getPageSlugs } = await import(
      filename
    );

    for (const slug of await getPageSlugs()) {
      const props = await getPageProps(slug);
      const content = <Component {...props} />;
      pages.push({ content, slug });
    }
  }
  return pages;
}
