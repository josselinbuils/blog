import cn from 'classnames';
import React, { FC, ImgHTMLAttributes, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getURL } from '../../utils/getURL';
import { withCSS } from '../CSSCollector/withCSS';
import { Highlight } from './Hightlight/Hightlight';

import styles, { css } from './Markdown.module.scss';
import { Head } from '../Head/Head';

const renderers = {
  code: ({ language, value }: { language: string; value: string }) => (
    <Highlight code={value} language={language} />
  ),
  image: ({ alt, src }: { alt: string; src: string }) => {
    let props = { alt } as ImgHTMLAttributes<HTMLImageElement>;

    src = getURL(src);

    try {
      props = JSON.parse(alt);
    } catch (e) {
      // Ignored
    }
    // TODO manage srcSet and base url

    return (
      <>
        {props.loading !== 'lazy' && (
          <Head>
            <link rel="preload" href={src} as="image" />
          </Head>
        )}
        <img src={src} {...props} />
      </>
    );
  },
  link: ({ children, href }: { children: ReactNode; href: string }) =>
    href.startsWith('/') ? (
      <a href={getURL(href)}>{children}</a>
    ) : (
      <a href={href} rel="noreferrer" target="_blank">
        {children}
      </a>
    ),
};

export const Markdown: FC<Props> = withCSS(
  ({ children, className, tag: MarkdownTag = 'div', ...forwardedProps }) => (
    <MarkdownTag className={cn(styles.markdown, className)}>
      <ReactMarkdown
        plugins={[remarkGfm]}
        renderers={renderers}
        source={children as string}
        {...forwardedProps}
      />
    </MarkdownTag>
  ),
  css
);

interface Props {
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
}
