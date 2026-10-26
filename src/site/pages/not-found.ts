import { buttonLink, html, sectionLabel, t } from '../html.ts';
import type { Page } from '../layout.ts';

/** Served by Cloudflare for any URL without a matching page. */
export function notFoundPage(): Page {
  return {
    path: '/404.html',
    kind: 'not-found',
    title: ['الصفحة غير موجودة | وصول', 'Page not found | Wosul'],
    description: 'الصفحة المطلوبة غير موجودة.',
    noindex: true,
    body: html`
      <section class="lab-intro wrap">
        <div>
          ${sectionLabel('404', ['الصفحة غير موجودة', 'PAGE NOT FOUND'])}
          <h1>${t(['هذا الرابط<br><em>لا يقود إلى صفحة.</em>', 'This link<br><em>doesn’t lead anywhere.</em>'])}</h1>
        </div>
        <p>${t([
          'ربما تغيّر العنوان أو كُتب بشكل مختلف. ابدأ من الصفحة الرئيسية، أو احكِ لنا عن فكرتك مباشرة.',
          'The address may have changed or been mistyped. Start from the home page, or tell us about your idea directly.',
        ])}</p>
      </section>
      <section class="service-next wrap section">
        ${buttonLink(['العودة للرئيسية', 'Back to the home page'], '/', 'ghost')}
        ${buttonLink(['احكِ لنا عن فكرتك', 'Tell us your idea'], '/#start', 'blue')}
      </section>
    `,
  };
}
