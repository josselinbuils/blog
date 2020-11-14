import baseGlob from 'glob';
import path from 'path';
import React, { ReactNode } from 'react';
import { promisify } from 'util';

const glob = promisify(baseGlob);
const pagesDir = path.join(process.cwd(), 'src/pages');

export interface Page {
  absolutePath: string;
  factory: () => Promise<ReactNode>;
  slug: string;
}

export async function getPages(): Promise<Page[]> {
  const pageFiles = await glob(`*.tsx`, {
    absolute: true,
    cwd: pagesDir,
    nodir: true,
  });

  const pageSlugPromises = pageFiles.map(async (filename) => {
    const { getPageSlugs } = await import(filename);
    const slugs = await getPageSlugs();
    return slugs.map((slug: string) => ({ filename, slug }));
  });

  const pageSlugs = (await Promise.all(pageSlugPromises)).flat();

  return pageSlugs.map(({ filename, slug }) => {
    // Prevents keeping the context because of filename
    async function factory() {
      const { default: Component, getPageProps } = await import(filename);
      const props = await getPageProps(slug);
      return <Component {...props} />;
    }
    return { absolutePath: filename, factory, slug };
  });
}
