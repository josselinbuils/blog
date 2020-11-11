declare module 'postcss-modules-sync';

declare module '*.scss' {
  const styles: Record<string, string>;
  export const cssMetadata: { css: string; id: string };
  export default styles;
}
