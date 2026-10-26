import { arrow, arrowIcon, downArrowIcon, serviceIcon } from '../../shared/icons.ts';
import { contactSection } from '../contact-form.ts';
import { faqs, methodSteps, projects, startingPoints, team } from '../content/home.ts';
import { services } from '../content/services.ts';
import { buttonLink, html, sectionLabel, t } from '../html.ts';
import type { Page } from '../layout.ts';
import { previews } from '../previews.ts';

export function homePage(): Page {
  return {
    path: '/',
    kind: 'home',
    title: ['وصول | نبني ما يوصلك.', 'Wosul | Built to take you further.'],
    description: 'أنظمة حجوزات وCRM ومواقع وتطبيقات. تصميم واضح وتطوير حول ما يحتاجه عملك.',
    scripts: ['contact-form'],
    body: [
      hero(),
      capabilityRibbon(),
      intro(),
      work(),
      servicesSection(),
      method(),
      studio(),
      startingPointsSection(),
      faq(),
      contactSection(),
    ].join(''),
  };
}

function hero(): string {
  return html`
    <section class="hero">
      <img class="hero-art" src="/images/wosul-glass-path.webp" width="1536" height="1024" alt="" fetchpriority="high" decoding="async">
      <div class="hero-shade"></div>
      <div class="hero-topline mono">
        <span>WOSUL / DIGITAL SYSTEMS STUDIO</span>
        <span class="hero-location">DESIGN → BUILD → CONNECT</span>
      </div>
      <div class="hero-content">
        <p class="eyebrow">${t(['وضوح في التجربة. قوة في النظام.', 'Clarity in experience. Strength in the system.'])}</p>
        <h1>${t(['نبني ما', 'Built to take'])}<br>${t(['يوصلك.', 'you further.'], 'span', 'class="accent"')}</h1>
        <p class="hero-desc">${t([
          'نصمّم ونطوّر أنظمة الحجوزات، إدارة العملاء، المواقع والتطبيقات، حول ما يحتاجه عملك فعلاً.',
          'We design and build booking systems, CRMs, websites and apps around what your business actually needs.',
        ])}</p>
        <div class="hero-buttons">
          ${buttonLink(['اكتشف ما نبنيه', 'Explore what we build'], '#work', 'blue')}
          ${buttonLink(['احكِ لنا عن فكرتك', 'Tell us your idea'], '#start', 'ghost')}
        </div>
      </div>
      <div class="hero-foot">
        <span class="mono">01 / A CLEARER WAY FORWARD</span>
        <a href="#intro">${t(['اكتشف وصول', 'Discover Wosul'])}${downArrowIcon}</a>
      </div>
    </section>
  `;
}

function capabilityRibbon(): string {
  return html`
    <div class="capability-ribbon">
      ${services.map(
        (service) => html`
          <a href="/services/${service.slug}/">
            <span class="mono">${service.number}</span>${t(service.name)}<span>${arrowIcon}</span>
          </a>
        `,
      )}
    </div>
  `;
}

function intro(): string {
  return html`
    <section id="intro" class="intro paper wrap section">
      <div>
        ${sectionLabel('01', ['الفكرة التي ننطلق منها', 'THE STARTING POINT'])}
        <h2>${t([
          'تجربة يفهمها عميلك.<br><em>ونظام يفهم شغلك.</em>',
          'An experience your customers understand.<br><em>A system that understands your work.</em>',
        ])}</h2>
      </div>
      <div class="intro-note">
        <span class="route-glyph" aria-hidden="true">${arrowIcon}</span>
        <p>${t([
          'نبدأ من طريقة عملك، ونحوّلها إلى تجربة رقمية واضحة. من أول شاشة يراها العميل، إلى الأدوات التي يعتمد عليها فريقك.',
          'We start with how you work and turn it into a clear digital experience, from the first screen a customer sees to the tools your team relies on.',
        ])}</p>
        <p class="small-copy">${t(['أربع خدمات، بفهم واحد للمشروع.', 'Four services. One understanding of the project.'])}</p>
      </div>
    </section>
  `;
}

function work(): string {
  return html`
    <section id="work" class="work section wrap">
      <div class="section-heading">
        <div>
          ${sectionLabel('02', ['مختبر وصول', 'THE WOSUL LAB'])}
          <h2>${t(['شوف الفكرة.<br><em>وجرّب كيف تعمل.</em>', 'See the idea.<br><em>Explore how it works.</em>'])}</h2>
        </div>
        <div>
          <p>${t([
            'تصميمات استكشافية تشرح كيف نربط التجربة بالنظام. افتح النموذج وتبدّل بين أدوار المستخدمين.',
            'Exploratory concepts showing how experience connects to a working system. Open a model and switch between user roles.',
          ])}</p>
          <span class="concept-note"><i></i>${t(['نماذج توضيحية ببيانات تجريبية', 'Illustrative concepts with sample data'])}</span>
        </div>
      </div>
      <div class="project-grid">
        ${projects.map(
          (project) => html`
            <article class="project${project.wide ? ' wide' : ''}">
              <a class="project-visual ${project.id}-visual" href="/lab/?demo=${project.id}" aria-label="${project.type}">
                ${previews[project.id]()}
                <span class="project-open">${arrow}</span>
              </a>
              <div class="project-caption">
                <div>
                  <span class="mono">${project.index} / ${project.type}</span>
                  <h3>${t(project.title)}</h3>
                  <p>${t(project.summary)}</p>
                </div>
                <a class="text-link" href="/lab/?demo=${project.id}">${t(['جرّب النموذج', 'Explore concept'])}${arrow}</a>
              </div>
            </article>
          `,
        )}
      </div>
      <div class="work-bottom">
        <p>${t([
          'هذه تصميمات من مختبر وصول لشرح الإمكانات، وليست مشاريع عملاء أو أنظمة تشغيل فعلية.',
          'These Wosul lab concepts explain possibilities. They are not client projects or production systems.',
        ])}</p>
        <a href="/lab/" class="text-link">${t(['افتح المختبر', 'Open the lab'])}${arrow}</a>
      </div>
    </section>
  `;
}

function servicesSection(): string {
  return html`
    <section id="services" class="services paper section wrap">
      <div class="section-heading">
        <div>
          ${sectionLabel('03', ['ماذا نبني', 'WHAT WE BUILD'])}
          <h2>${t(['من أول زيارة،<br><em>إلى آخر متابعة.</em>', 'From the first visit,<br><em>to the next follow-up.</em>'])}</h2>
        </div>
        <p>${t([
          'نختار طريقة التنفيذ بعد فهم الاحتياج: تخصيص نظام قائم، أو تطوير حلّ مصمّم للمشروع.',
          'We choose the approach after understanding the need: configuring an existing platform or building a purpose-designed solution.',
        ])}</p>
      </div>
      <div class="service-grid">
        ${services.map(
          (service) => html`
            <a class="service-card" href="/services/${service.slug}/">
              <div class="service-card-top">
                <span class="mono">${service.number} / ${service.cardLabel}</span>${serviceIcon(service.id)}
              </div>
              <h3>${t(service.name)}</h3>
              <p>${t(service.description)}</p>
              <ul>${service.highlights.map((item) => `<li>${t(item)}</li>`)}</ul>
              <span class="service-card-foot">${t(['استكشف الخدمة', 'Explore the service'])}${arrow}</span>
            </a>
          `,
        )}
      </div>
    </section>
  `;
}

function method(): string {
  return html`
    <section id="method" class="method section wrap">
      <div class="method-heading">
        ${sectionLabel('04', ['طريقة العمل', 'OUR METHOD'])}
        <h2>${t(['نتّفق على النتيجة.<br><em>ثم نبني الطريق.</em>', 'Agree on the outcome.<br><em>Then build the way.</em>'])}</h2>
        <p>${t(['نطاق واضح، مراجعات متّفق عليها، وتسليم تعرف ما الذي يشمله.', 'A clear scope, agreed review points and a handover you understand.'])}</p>
        <div class="method-route" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
      </div>
      <div class="method-list">
        ${methodSteps.map(
          (step, i) => html`
            <details${i === 0 ? ' open' : ''}>
              <summary><span class="mono">0${i + 1}</span>${t(step.title, 'h3')}<span class="detail-plus">+</span></summary>
              <p>${t(step.text)}</p>
            </details>
          `,
        )}
      </div>
    </section>
  `;
}

function studio(): string {
  return html`
    <section id="studio" class="studio paper wrap section">
      <div class="section-heading">
        <div>
          ${sectionLabel('05', ['الناس خلف وصول', 'THE PEOPLE BEHIND WOSUL'])}
          <h2>${t(['فهم للأعمال.<br><em>وتنفيذ له أصحاب.</em>', 'Business understanding.<br><em>People who build.</em>'])}</h2>
        </div>
        <p>${t([
          'تواصل مباشر مع الفريق الذي يحوّل احتياجك إلى تجربة ونظام. أدوار متكاملة، من تعريف المشكلة إلى التطوير.',
          'Direct contact with the team turning your needs into an experience and a system. Complementary roles, from defining the problem to building the solution.',
        ])}</p>
      </div>
      <div class="team-grid">
        ${team.map(
          (member, i) => html`
            <article>
              <div class="team-photo">
                <img src="${member.photo}" width="480" height="480" alt="" loading="lazy" decoding="async">
                <b class="mono">0${i + 1}</b>
              </div>
              <h3>${t(member.name)}</h3>
              <strong>${t(member.role)}</strong>
              <p>${t(member.bio)}</p>
            </article>
          `,
        )}
      </div>
    </section>
  `;
}

function startingPointsSection(): string {
  return html`
    <section class="starting-points wrap section">
      <div class="section-heading">
        <div>
          ${sectionLabel('06', ['نقطة البداية', 'A WAY TO START'])}
          <h2>${t(['نطاق يناسب<br><em>خطوتك القادمة.</em>', 'A scope that fits<br><em>your next step.</em>'])}</h2>
        </div>
        <p>${t([
          'السعر والمدة يتحدّدان بعد فهم الوظائف والمحتوى والربط. كل مشروع يبدأ بتحديد ما سنبنيه وما ستستلمه.',
          'Price and timing follow the features, content and integrations. Every project starts with clarity about what we build and what you receive.',
        ])}</p>
      </div>
      <div class="scope-grid">
        ${startingPoints.map(
          (scope, i) => html`
            <article class="scope-card${scope.featured ? ' featured' : ''}">
              <span class="mono">0${i + 1} / STARTING POINT</span>
              <h3>${t(scope.title)}</h3>
              <p>${t(scope.summary)}</p>
              <div class="scope-rule"></div>
              <p class="small-copy">${t(scope.scope)}</p>
              <a href="#start" class="text-link" data-pick="${scope.service}">${t(['ناقش هذا النطاق', 'Discuss this scope'])}${arrow}</a>
            </article>
          `,
        )}
      </div>
    </section>
  `;
}

function faq(): string {
  return html`
    <section class="faq paper wrap section">
      <div>
        ${sectionLabel('07', ['قبل أن نبدأ', 'BEFORE WE START'])}
        <h2>${t(['أسئلة تستحق<br><em>إجابات واضحة.</em>', 'Good questions.<br><em>Clear answers.</em>'])}</h2>
      </div>
      <div>
        ${faqs.map(
          (item, i) => html`
            <details>
              <summary><span class="mono">0${i + 1}</span>${t(item.question)}<span class="detail-plus">+</span></summary>
              <p>${t(item.answer)}</p>
            </details>
          `,
        )}
      </div>
    </section>
  `;
}
