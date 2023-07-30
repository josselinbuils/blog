import cn from 'classnames';
import React, { cloneElement, type FC, type ReactElement } from 'react';
import ReactDOMServer from 'react-dom/server';
import { CSSCollector } from '../CSSCollector/CSSCollector';
import { HeadCollector } from '../Head/HeadCollector';
import styles, { cssMetadata } from './Page.module.scss';

interface Props {
  children: ReactElement;
  description: string;
  title: string;
}

export const Page: FC<Props> = ({ children: child, description, title }) => {
  const headCollector = new HeadCollector();
  const cssCollector = new CSSCollector();
  const { css, id } = cssMetadata;
  cssCollector.add(id, css);
  const body = ReactDOMServer.renderToStaticMarkup(
    headCollector.collect(
      cssCollector.collect(
        <>
          <input
            aria-hidden
            className={styles.lighting}
            role="switch"
            type="checkbox"
          />
          {cloneElement(child, {
            className: cn(child.props.className, styles.main),
          })}
        </>,
      ),
    ),
  );
  const style = cssCollector.retrieve();
  const head = headCollector.retrieve();

  return (
    <html lang="en">
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={description} />
        {head}
        {style}
      </head>
      <body dangerouslySetInnerHTML={{ __html: body }} />
    </html>
  );
};
