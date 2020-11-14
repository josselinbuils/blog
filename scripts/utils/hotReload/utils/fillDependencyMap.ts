import path from 'path';
import { SRC_DIR } from '../../../constants';

const srcAbsolutePath = path.join(process.cwd(), SRC_DIR);

export function fillDependencyMap(
  map: { [filename: string]: Set<string> },
  module: NodeJS.Module
) {
  if (module !== undefined) {
    module.children
      .filter((childModule) => childModule.filename.startsWith(srcAbsolutePath))
      .forEach((childModule) => {
        if (map[childModule.filename] === undefined) {
          map[childModule.filename] = new Set<string>();
        }
        map[childModule.filename].add(childModule.filename);
        map[childModule.filename].add(module.filename);
        map[module.filename]?.forEach((filename) => {
          map[childModule.filename].add(filename);
        });
        fillDependencyMap(map, childModule);
      });
  }
  return map;
}
