import { loadSassModules } from '../components/SassModuleProvider/loadSassModules';

const sassModules = loadSassModules();

export function getStyles(filename: string): Record<string, string> {
  return sassModules[filename];
}
