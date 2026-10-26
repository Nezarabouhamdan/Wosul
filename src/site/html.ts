/** Helpers for writing the page templates in plain TypeScript. */
import type { Bilingual } from '../shared/catalog.ts';
import { escapeHtml } from '../shared/html.ts';
import { arrow } from '../shared/icons.ts';

export { escapeHtml };

type Value = string | number | false | null | undefined | readonly Value[];

/**
 * Tagged template for HTML. Line breaks (and the indentation after them) in
 * the template source are dropped, so templates can be formatted for reading
 * without adding whitespace to the page. Never break a line inside text.
 *
 * Arrays are joined and false/null/undefined render nothing. Values are
 * inserted as-is because all copy is trusted; escape anything else.
 */
export function html(strings: TemplateStringsArray, ...values: Value[]): string {
  let out = '';
  strings.forEach((part, i) => {
    out += part.replace(/\n\s*/g, '');
    if (i < values.length) out += render(values[i]);
  });
  return out;
}

function render(value: Value): string {
  if (Array.isArray(value)) return value.map(render).join('');
  return value === false || value == null ? '' : String(value);
}

const withAttributes = (attributes: string) => (attributes ? ` ${attributes}` : '');

/**
 * Bilingual text. Renders the Arabic copy and keeps both versions in data
 * attributes for the language switch (see src/client/main.ts).
 */
export function t([ar, en]: Bilingual, tag = 'span', attributes = ''): string {
  return `<${tag} data-ar="${escapeHtml(ar)}" data-en="${escapeHtml(en)}"${withAttributes(attributes)}>${ar}</${tag}>`;
}

/** A pill-shaped link button with the arrow icon. */
export function buttonLink(text: Bilingual, href: string, variant = 'blue', attributes = ''): string {
  return `<a class="btn ${variant}" href="${href}"${withAttributes(attributes)}>${t(text)}${arrow}</a>`;
}

/** The "[ 01 / WOSUL ] Title" label above each section heading. */
export function sectionLabel(number: string, text: Bilingual): string {
  return `<div class="section-kicker"><span class="mono">[ ${number} / WOSUL ]</span>${t(text)}</div>`;
}
