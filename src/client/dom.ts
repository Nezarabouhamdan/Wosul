import type { Language } from '../shared/catalog.ts';

/** Fired on document after the language switch has updated the page. */
export const LANGUAGE_CHANGE = 'wosul:languagechange';

export function currentLanguage(): Language {
  return document.documentElement.lang === 'en' ? 'en' : 'ar';
}

/** Picks the copy for the current language. */
export function tr(ar: string, en: string): string {
  return currentLanguage() === 'en' ? en : ar;
}

/** querySelector that fails loudly when the page markup and script disagree. */
export function element<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T {
  const found = root.querySelector<T>(selector);
  if (!found) throw new Error(`Missing element: ${selector}`);
  return found;
}

export function elements<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T[] {
  return [...root.querySelectorAll<T>(selector)];
}
