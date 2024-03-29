import type { Environment, hooks, Token } from 'prismjs';
import Prism from 'prismjs';
import 'prismjs/components/prism-css.min.js';
import 'prismjs/components/prism-javascript.min.js';
import 'prismjs/components/prism-json.min.js';
import 'prismjs/components/prism-markdown.min.js';
import 'prismjs/components/prism-markup.min.js';
import 'prismjs/components/prism-markup-templating.min.js';
import 'prismjs/components/prism-scss.min.js';
import 'prismjs/components/prism-typescript.min.js';
import 'prismjs/components/prism-yaml.min.js';
import styles from './Hightlight.module.scss';

export function highlightCode(code: string, language: string): string {
  if (Prism.languages[language] === undefined) {
    return escapeHtml(code);
  }

  Prism.hooks.add('after-tokenize', afterTokenizeHook);
  Prism.hooks.add('wrap', wrapHook);

  const highlighted = Prism.highlight(
    code,
    Prism.languages[language],
    language,
  );

  removeHook('after-tokenize', afterTokenizeHook);
  removeHook('wrap', wrapHook);

  return highlighted.slice(-1) === '\n' ? `${highlighted} ` : highlighted;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function afterTokenizeHook(env: Environment): void {
  const tokens = env.tokens as (string | Token)[];

  env.tokens = tokens.map((token) => {
    if (typeof token === 'string') {
      return token;
    }
    if (token.content === ';') {
      token.type = 'keyword';
    }
    if (styles[token.type] === undefined) {
      return token.content;
    }
    return token;
  });
}

function removeHook(name: string, callback: hooks.HookCallback): void {
  const callbacks = Prism.hooks.all[name];
  const callbackIndex = callbacks.indexOf(callback);

  if (callbackIndex !== -1) {
    callbacks.splice(callbackIndex, 1);
  }
}

function wrapHook(env: Environment): void {
  env.classes = (env.classes as string[]).slice(1).map((c) => styles[c]);
  env.tag = 'i';
}
