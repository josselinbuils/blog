import React, { createContext, ReactNode } from 'react';

export const CSSCollectorContext = createContext({
  add: (() => {}) as (css: string) => void,
});

export class CSSCollector {
  css = [] as string[];

  add = (css: string) => {
    if (!this.css.includes(css)) {
      this.css.push(css);
    }
  };

  collect(children: ReactNode) {
    const { add } = this;

    return (
      <CSSCollectorContext.Provider value={{ add }}>
        {children}
      </CSSCollectorContext.Provider>
    );
  }

  retrieve(): string {
    return this.css.join('');
  }
}
