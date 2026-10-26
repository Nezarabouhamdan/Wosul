/**
 * Public address of the site, used for canonical links, social previews,
 * the sitemap and robots.txt. Set SITE_URL when building for a new domain:
 *   SITE_URL=https://wosul.example npm run build
 */
export const SITE_URL = (process.env.SITE_URL ?? 'https://wosul-studio.fuzzymars8.chatgpt.site').replace(/\/+$/, '');

export const THEME_COLOR = '#080B10';
