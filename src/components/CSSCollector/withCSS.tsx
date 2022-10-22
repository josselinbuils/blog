import type { FC } from 'react';
import React, { useContext } from 'react';
import { CSSCollectorContext } from './CSSCollector';

export function withCSS<T extends Record<any, any>>(
  Component: FC<T>,
  { css, id }: { css: string; id: string }
): FC<T> {
  return (props) => {
    const { add } = useContext(CSSCollectorContext);
    add(id, css);
    return <Component {...props} />;
  };
}
