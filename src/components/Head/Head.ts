import type { FC, ReactNode } from 'react';
import { useContext } from 'react';
import { HeadCollectorContext } from './HeadCollector';

interface Props {
  children: ReactNode;
}

export const Head: FC<Props> = ({ children }) => {
  const { add } = useContext(HeadCollectorContext);
  add(children);
  return null;
};
