declare module 'postcss-modules-sync';

declare module '*.scss' {
  const styles: Record<string, string>;
  export const css: string;
  export default styles;
}
