import React, { createContext, ReactNode } from 'react';

export const HeadCollectorContext = createContext({
  add: (() => {}) as (children: ReactNode) => void,
});

export class HeadCollector {
  readonly nodes = [] as ReactNode[];

  add = (children: ReactNode) => {
    this.nodes.push(children);
  };

  collect(children: ReactNode) {
    const { add } = this;

    return (
      <HeadCollectorContext.Provider value={{ add }}>
        {children}
      </HeadCollectorContext.Provider>
    );
  }

  retrieve(): ReactNode {
    const { nodes } = this;
    return <>{nodes}</>;
  }
}
