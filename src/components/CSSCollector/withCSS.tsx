import React, { FC, useContext } from 'react';
import { CSSCollectorContext } from './CSSCollector';

export function withCSS<T>(Component: FC<T>, css: string): FC<T> {
  return (props) => {
    const { add } = useContext(CSSCollectorContext);
    add(css);
    return <Component {...props} />;
  };
}
