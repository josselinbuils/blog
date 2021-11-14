import React, { createContext, ReactNode } from 'react';

export const CSSCollectorContext = createContext({
  add: (() => {}) as (id: string, css: string) => void,
});

export class CSSCollector {
  styleMap = new Map<string, string>();

  add = (id: string, css: string) => {
    if (!this.styleMap.has(id)) {
      this.styleMap.set(id, css);
    }
  };

  collector = { add: this.add };

  collect(children: ReactNode) {
    const { collector } = this;

    return (
      <CSSCollectorContext.Provider value={collector}>
        {children}
      </CSSCollectorContext.Provider>
    );
  }

  retrieve(): ReactNode {
    if (process.env.NODE_ENV === 'production') {
      return (
        <style
          dangerouslySetInnerHTML={{
            __html: [...this.styleMap.values()].join(''),
          }}
        />
      );
    }
    return [...this.styleMap.entries()].map(([id, css]) => (
      <style key={id} id={id} dangerouslySetInnerHTML={{ __html: css }} />
    ));
  }
}
