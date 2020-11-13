export function getPostSlug(filename: string): string {
  return filename.replace(/^.*[\\/]/g, '').slice(0, -3);
}
