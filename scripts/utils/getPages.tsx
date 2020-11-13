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

    pages.push(
      ...(await getPageSlugs()).map(async (slug: string) => ({
        content: <Component {...await getPageProps(slug)} />,
        slug,
      }))
    );
  }
  return pages;
}
