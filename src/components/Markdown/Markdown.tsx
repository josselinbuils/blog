import cn from 'classnames';
import type { FC, ImgHTMLAttributes, ReactNode } from 'react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getURL } from '../../utils/getURL';
import { withCSS } from '../CSSCollector/withCSS';
import { Head } from '../Head/Head';
import { Highlight } from './Hightlight/Hightlight';
import styles, { cssMetadata } from './Markdown.module.scss';

const components = {
  a: ({ children, href }: { children: ReactNode; href: string }) =>
    href.startsWith('/') ? (
      <a href={getURL(href)}>{children}</a>
    ) : (
      <a href={href} rel="noreferrer" target="_blank">
        {children}
      </a>
    ),
  code({
    className,
    children,
  }: {
    className: string | undefined;
    children: string[];
  }) {
    const language = /language-(\w+)/.exec(className || '')?.[1];

    return language ? (
      <Highlight
        code={String(children).replace(/\n$/, '')}
        language={language}
      />
    ) : (
      <code>{children}</code>
    );
  },
  img: ({ alt: options, src }: { alt: string; src: string }) => {
    let props = { alt: options } as ImgHTMLAttributes<HTMLImageElement>;

    src = getURL(src);

    try {
      props = JSON.parse(options);
    } catch (e) {
      // Ignored
    }
    // TODO manage srcSet and base url

    const { alt, loading } = props;

    return (
      <>
        {loading !== 'lazy' && (
          <Head>
            <link rel="preload" href={src} as="image" />
          </Head>
        )}
        <img alt={alt} src={src} {...props} />
      </>
    );
  },
};

interface Props {
  children: string;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
}

export const Markdown: FC<Props> = withCSS<Props>(
  ({ children, className, tag: MarkdownTag = 'div', ...forwardedProps }) => (
    <MarkdownTag className={cn(styles.markdown, className)}>
      <ReactMarkdown
        components={components as any}
        remarkPlugins={[remarkGfm]}
        {...forwardedProps}
      >
        {children}
      </ReactMarkdown>
    </MarkdownTag>
  ),
  cssMetadata
);
