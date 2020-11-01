import { FC, useContext } from 'react';
import { HeadCollectorContext } from './HeadCollector';

export const Head: FC = ({ children }) => {
  const { add } = useContext(HeadCollectorContext);
  add(children);
  return null;
};
