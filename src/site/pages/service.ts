import { backArrowIcon } from '../../shared/icons.ts';
import type { Service } from '../content/services.ts';
import { buttonLink, html, sectionLabel, t } from '../html.ts';
import type { Page } from '../layout.ts';
import { previews } from '../previews.ts';

export function servicePage(service: Service): Page {
  const contactUrl = `/?service=${service.id}#start`;
  return {
    path: `/services/${service.slug}/`,
    kind: 'service',
    title: [`${service.name[0]} | وصول`, `${service.name[1]} | Wosul`],
    description: service.description[0],
    body: html`
      <section class="service-hero wrap">
        <div class="service-hero-copy">
          <a class="back-link" href="/#services">${t(['كل الخدمات', 'All services'])} ${backArrowIcon}</a>
          <div class="mono">${service.number} / WOSUL ${service.id.toUpperCase()}</div>
          <h1>${t(service.tagline)}</h1>
          <p>${t(service.description)}</p>
          <div class="hero-buttons">
            ${buttonLink(['ناقش مشروعك', 'Discuss your project'], contactUrl, 'blue')}
            ${buttonLink(['جرّب التصوّر', 'Explore the concept'], `/lab/?demo=${service.id}`, 'ghost')}
          </div>
        </div>
        <div class="service-hero-preview ${service.id}-visual">${previews[service.id]()}</div>
      </section>
      <section class="service-delivery paper wrap section">
        <div>
          ${sectionLabel(service.number, ['نطاق واضح، من البداية', 'CLARITY FROM THE START'])}
          <h2>${t(['ما الذي<br><em>نبنيه معك؟</em>', 'What do we<br><em>build together?</em>'])}</h2>
          <p>${t(service.audience)}</p>
        </div>
        <div>
          <h3>${t(['تسليمات نحدّدها معك', 'Deliverables we define with you'])}</h3>
          <ol class="deliverable-list">
            ${service.deliverables.map((item, i) => `<li><span class="mono">0${i + 1}</span>${t(item)}</li>`)}
          </ol>
          <div class="agreement-note">
            <h3>${t(['قبل أن نؤكّد العرض', 'Before we confirm the proposal'])}</h3>
            <p>${t(service.toAgree)}</p>
          </div>
        </div>
      </section>
      <section class="service-next wrap section">
        <h2>${t(['من احتياج واضح،<br><em>إلى خطة تنفيذ.</em>', 'From a clear need,<br><em>to a delivery plan.</em>'])}</h2>
        ${buttonLink(['حضّر فكرة مشروعك', 'Prepare your project idea'], contactUrl, 'blue')}
      </section>
    `,
  };
}
