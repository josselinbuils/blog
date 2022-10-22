import type { ReactNode } from 'react';
import React, { createContext } from 'react';

export const HeadCollectorContext = createContext({
  add: (() => {}) as (children: ReactNode) => void,
});

export class HeadCollector {
  readonly nodes = [] as ReactNode[];

  collector = {
    add: (children: ReactNode) => {
      this.nodes.push(children);
    },
  };

  collect(children: ReactNode) {
    const { collector } = this;

    return (
      <HeadCollectorContext.Provider value={collector}>
        {children}
      </HeadCollectorContext.Provider>
    );
  }

  retrieve(): ReactNode[] {
    return this.nodes;
  }
}
