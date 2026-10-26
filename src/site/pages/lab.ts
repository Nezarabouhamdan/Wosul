import { serviceIcon } from '../../shared/icons.ts';
import { services } from '../content/services.ts';
import { buttonLink, html, sectionLabel, t } from '../html.ts';
import type { Page } from '../layout.ts';

/** The interactive demos are rendered in the browser by src/client/lab.ts. */
export function labPage(): Page {
  return {
    path: '/lab/',
    kind: 'lab',
    title: ['مختبر وصول | جرّب الفكرة', 'Wosul Lab | Explore the idea'],
    description: 'نماذج تفاعلية توضيحية للحجوزات وإدارة العملاء والمواقع والتطبيقات، ببيانات تجريبية.',
    scripts: ['lab'],
    body: html`
      <section class="lab-intro wrap">
        <div>
          ${sectionLabel('LAB', ['مختبر وصول', 'THE WOSUL LAB'])}
          <h1>${t(['الفكرة تصبح<br><em>أوضح عندما تجرّبها.</em>', 'Ideas get clearer<br><em>when you try them.</em>'])}</h1>
        </div>
        <p>${t([
          'استكشف تصوّرات للحجوزات وإدارة العملاء والموبايل والموقع. البيانات تجريبية، وكل التغييرات تبقى ضمن هذه الجلسة.',
          'Explore concepts for bookings, CRM, mobile and websites. All data is sample data, and changes stay in this session.',
        ])}</p>
      </section>
      <section class="lab-workspace wrap">
        <div class="lab-toolbar">
          <div class="lab-tabs" role="tablist" aria-label="اختيار النموذج / Choose a concept">
            ${services.map(
              (service, i) => html`
                <button id="lab-tab-${service.id}" role="tab" aria-selected="${String(i === 0)}" aria-controls="lab-panel" data-demo="${service.id}">
                  ${serviceIcon(service.id)}${t(service.name)}
                </button>
              `,
            )}
          </div>
          <span class="concept-note"><i></i>${t(['تجربة توضيحية', 'Illustrative demo'])}</span>
        </div>
        <div class="lab-panel" id="lab-panel" role="tabpanel" aria-labelledby="lab-tab-booking"></div>
        <div class="lab-explainer" id="lab-explainer"></div>
      </section>
      <section class="service-next paper wrap section">
        <div>
          <h2>${t(['قريب من احتياجك؟', 'Close to what you need?'])}</h2>
          <p>${t([
            'هذا التصوّر بداية للنقاش. الوظائف والربط والتصميم تُحدّد حول نشاطك.',
            'This concept starts a conversation. Features, integrations and design are scoped around your business.',
          ])}</p>
        </div>
        ${buttonLink(['احكِ لنا عن مشروعك', 'Tell us about your project'], '/#start', 'blue')}
      </section>
    `,
  };
}
