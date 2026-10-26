/**
 * Builds the public site into dist/ (served by Cloudflare as static assets):
 *   1. copies public/ (fonts, images, _headers);
 *   2. bundles and minifies the browser scripts and stylesheets, with a
 *      content hash in each file name so browsers can cache them for a year;
 *   3. renders every page to HTML, plus sitemap.xml and robots.txt.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
import type { Metafile } from 'esbuild';
import { SITE_URL } from '../src/site/config.ts';
import { services } from '../src/site/content/services.ts';
import { renderDocument } from '../src/site/layout.ts';
import type { AssetUrls, Page } from '../src/site/layout.ts';
import { homePage } from '../src/site/pages/home.ts';
import { labPage } from '../src/site/pages/lab.ts';
import { notFoundPage } from '../src/site/pages/not-found.ts';
import { servicePage } from '../src/site/pages/service.ts';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');

/** Browser bundles, referenced by name from the page templates. */
const CLIENT_ENTRIES = {
  'site.css': 'src/styles/site.css',
  'main.js': 'src/client/main.ts',
  'lab.js': 'src/client/lab.ts',
  'contact-form.js': 'src/client/contact-form.ts',
};

const pages: Page[] = [homePage(), ...services.map(servicePage), labPage(), notFoundPage()];

// Font and image URLs in the CSS point at files copied from public/.
const external = ['/fonts/*', '/images/*'];

async function bundleClientAssets(): Promise<AssetUrls> {
  const shared = {
    bundle: true,
    minify: true,
    metafile: true,
    external,
    outdir: path.join(dist, 'static'),
    entryNames: '[name].[hash]',
    logLevel: 'warning',
  } as const;
  const entries = Object.entries(CLIENT_ENTRIES);
  const entryPoints = (extension: string) =>
    Object.fromEntries(
      entries.filter(([name]) => name.endsWith(extension)).map(([name, file]) => [path.parse(name).name, file]),
    );

  const [scripts, styles] = await Promise.all([
    build({ ...shared, entryPoints: entryPoints('.js'), format: 'esm', target: 'es2020' }),
    build({ ...shared, entryPoints: entryPoints('.css') }),
  ]);

  const urls: AssetUrls = {};
  for (const metafile of [scripts.metafile, styles.metafile]) {
    for (const [output, info] of Object.entries(metafile.outputs as Metafile['outputs'])) {
      const entry = entries.find(([, file]) => file === info.entryPoint);
      if (entry) urls[entry[0]] = '/' + path.relative(dist, path.resolve(root, output)).replaceAll('\\', '/');
    }
  }
  return urls;
}

/** The inbox stylesheet keeps a fixed URL because the Worker links to it. */
async function bundleInboxStyles(): Promise<void> {
  await build({
    entryPoints: ['src/styles/inbox.css'],
    outfile: path.join(dist, 'inbox.css'),
    bundle: true,
    minify: true,
    external,
    logLevel: 'warning',
  });
}

async function writePage(page: Page, assets: AssetUrls): Promise<void> {
  const file = path.join(dist, page.path.endsWith('/') ? `${page.path}index.html` : page.path);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, renderDocument(page, assets));
}

/** Empties dist/ in place; deleting the folder itself breaks `wrangler dev`'s watcher on Windows. */
async function emptyDirectory(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
  for (const entry of await fs.readdir(dir)) {
    await fs.rm(path.join(dir, entry), { recursive: true, force: true });
  }
}

function sitemap(): string {
  const urls = pages.filter((page) => !page.noindex).map((page) => `<url><loc>${SITE_URL}${page.path}</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>\n`;
}

process.chdir(root);
await emptyDirectory(dist);
await fs.cp(path.join(root, 'public'), dist, { recursive: true });

const [assets] = await Promise.all([bundleClientAssets(), bundleInboxStyles()]);
await Promise.all(pages.map((page) => writePage(page, assets)));
await fs.writeFile(path.join(dist, 'sitemap.xml'), sitemap());
await fs.writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(`Built ${pages.length} pages for ${SITE_URL} into dist/`);
