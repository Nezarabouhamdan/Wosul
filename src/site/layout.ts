import type { Bilingual } from '../shared/catalog.ts';
import { arrow, chevronIcon, serviceIcon } from '../shared/icons.ts';
import { SITE_URL, THEME_COLOR } from './config.ts';
import { services } from './content/services.ts';
import { buttonLink, escapeHtml, html, t } from './html.ts';

export interface Page {
  /** URL path, always ending in a slash, e.g. "/services/crm/". */
  path: string;
  /** Exposed as <body data-page>, a hook for page-specific styling. */
  kind: 'home' | 'service' | 'lab' | 'not-found';
  title: Bilingual;
  description: string;
  body: string;
  /** Page-specific client bundles (see CLIENT_ENTRIES in scripts/build.ts). */
  scripts?: string[];
  /** Hidden from search engines and the sitemap. */
  noindex?: boolean;
}

/** Maps a source asset name (e.g. "site.css") to its fingerprinted URL. */
export type AssetUrls = Record<string, string>;

const wordmark = '<img src="/images/wosul-wordmark-dark.svg" width="229" height="140" alt="Wosul وصول">';

const current = (href: string, currentPath: string) => (href === currentPath ? ' aria-current="page"' : '');

/**
 * The "Services" tab opens a menu of the service pages: on hover or click
 * on desktop, as an expanding list in the phone menu (see src/client/main.ts).
 */
function servicesMenu(currentPath: string): string {
  const links = services.map((service) => ({ service, href: `/services/${service.slug}/` }));
  const onServicePage = links.some(({ href }) => href === currentPath);
  return html`
    <div class="nav-services">
      <button class="nav-services-toggle${onServicePage ? ' is-current' : ''}" id="services-toggle" aria-expanded="false" aria-controls="services-menu">
        ${t(['الخدمات', 'Services'])}${chevronIcon}
      </button>
      <div class="services-menu" id="services-menu">
        ${links.map(
          ({ service, href }) => html`
            <a class="services-menu-item" href="${href}"${current(href, currentPath)}>
              <span class="services-menu-icon">${serviceIcon(service.id)}</span>
              <span>${t(service.name, 'strong')}${t(service.menuSummary, 'small')}</span>
            </a>
          `,
        )}
        <a class="services-menu-all" href="/#services">${t(['كل الخدمات', 'All services'])}${arrow}</a>
      </div>
    </div>
  `;
}

function header(currentPath: string): string {
  return html`
    <a class="skip" href="#main">${t(['انتقل للمحتوى', 'Skip to content'])}</a>
    <header class="header">
      <a class="logo" href="/" aria-label="Wosul وصول">${wordmark}</a>
      <nav id="navigation" aria-label="التنقل / Navigation">
        <a href="/"${current('/', currentPath)}>${t(['الرئيسية', 'Home'])}</a>
        ${servicesMenu(currentPath)}
        <a href="/lab/"${current('/lab/', currentPath)}>${t(['المختبر', 'Lab'])}</a>
        <a href="/#studio">${t(['الفريق', 'Team'])}</a>
        <a class="mobile-project" href="/#start">${t(['ابدأ مشروعك', 'Start a project'])}</a>
      </nav>
      <div class="header-end">
        <button id="language" class="lang" aria-label="Switch to English">EN</button>
        ${buttonLink(['ابدأ مشروعك', 'Start a project'], '/#start', 'blue small')}
        <button class="menu" id="menu" aria-label="القائمة / Menu" aria-expanded="false" aria-controls="navigation"><span></span><span></span></button>
      </div>
    </header>
  `;
}

function footer(): string {
  return html`
    <footer class="footer">
      <div class="footer-top">
        <a href="/" class="footer-brand">${wordmark}</a>
        <div>
          ${t(['نبني ما يوصلك.', 'Built to take you further.'], 'h3')}
          <p>${t(['حجوزات، CRM، مواقع وتطبيقات.', 'Bookings, CRM, websites and apps.'])}</p>
        </div>
        <a href="/#start" class="footer-cta">${t(['خلّينا نناقش فكرتك', 'Let’s discuss your idea'])}${arrow}</a>
      </div>
      <div class="footer-bottom">
        <span class="mono">WOSUL © ${new Date().getFullYear()}</span>
        ${t(['من الفكرة، إلى التجربة، إلى النظام.', 'From idea, to experience, to system.'])}
        <a href="/lab/">${t(['جرّب النماذج', 'Explore the concepts'])}</a>
      </div>
    </footer>
  `;
}

export function renderDocument(page: Page, assets: AssetUrls): string {
  const url = SITE_URL + page.path;
  const description = escapeHtml(page.description);
  const title = escapeHtml(page.title[0]);
  const scripts = ['main', ...(page.scripts ?? [])];
  return html`
    <!doctype html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
      ${t(page.title, 'title')}
      <meta name="description" content="${description}">
      ${page.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`}
      <meta name="theme-color" content="${THEME_COLOR}">
      <meta property="og:type" content="website">
      <meta property="og:url" content="${url}">
      <meta property="og:title" content="${title}">
      <meta property="og:description" content="${description}">
      <meta property="og:image" content="${SITE_URL}/images/wosul-social-cover.png">
      <meta name="twitter:card" content="summary_large_image">
      <link rel="icon" type="image/svg+xml" href="/images/wosul-icon.svg">
      <link rel="preload" href="/fonts/Cairo-Arabic-Variable.woff2" as="font" type="font/woff2" crossorigin>
      <link rel="preload" href="/fonts/NotoSans-Regular.woff2" as="font" type="font/woff2" crossorigin>
      <link rel="stylesheet" href="${assets['site.css']}">
      ${scripts.map((name) => `<script type="module" src="${assets[`${name}.js`]}"></script>`)}
    </head>
    <body data-page="${page.kind}">
      ${header(page.path)}
      <main id="main">${page.body}</main>
      ${footer()}
      <noscript><p class="noscript">الصفحات متاحة للقراءة. فعّل JavaScript لتجربة النماذج والتبديل بين اللغات.</p></noscript>
    </body>
    </html>
  `;
}
