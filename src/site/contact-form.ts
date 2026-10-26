/**
 * The "letter" contact form at the bottom of the home page.
 * Behaviour lives in src/client/contact-form.ts; limits in src/shared/inquiry.ts.
 */
import type { Bilingual } from '../shared/catalog.ts';
import { TIMELINES } from '../shared/catalog.ts';
import { arrow, arrowIcon, checkIcon, serviceIcon } from '../shared/icons.ts';
import { LIMITS } from '../shared/inquiry.ts';
import { services } from './content/services.ts';
import { escapeHtml, html, sectionLabel, t } from './html.ts';

/** A labelled input with an optional help line and a slot for its error message. */
function field(id: string, label: Bilingual, input: string, help = ''): string {
  return html`
    <label class="letter-field" for="${id}">
      ${t(label)}${input}${help}
      <span class="field-error" id="${id}-error" data-error-for="${id}"></span>
    </label>
  `;
}

const help = (id: string, text: Bilingual) => `<span class="field-help" id="${id}">${t(text)}</span>`;

/** Placeholder text that follows the language switch. */
function placeholder(text: Bilingual): string {
  const [ar, en] = text.map(escapeHtml);
  return `placeholder="${ar}" data-placeholder-ar="${ar}" data-placeholder-en="${en}"`;
}

export function contactSection(): string {
  return html`
    <section id="start" class="start section wrap">
      <div class="start-copy">
        ${sectionLabel('08', ['رسالة نبدأ منها', 'A LETTER TO START WITH'])}
        <h2>${t(['خلّينا نسمع<br><em>عن فكرتك.</em>', 'Tell us where<br><em>you want to go.</em>'])}</h2>
        <p>${t([
          'عرّفنا عليك وعلى ما يحتاجه عملك. اختَر الخدمة، واحكِ لنا عن الفكرة أو المشكلة، لنبدأ الحديث من نقطة واضحة.',
          'Introduce yourself and what your business needs. Choose a service and tell us about the idea or challenge, so our conversation starts with clarity.',
        ])}</p>
        <div class="start-mark" aria-hidden="true">${arrowIcon}</div>
      </div>
      <form id="project-form" class="project-letter" action="/api/inquiries" method="post" novalidate>
        <div class="letter-heading">
          <span class="mono">TO / WOSUL STUDIO</span>
          ${t(['من فكرتك، إلى أول حديث.', 'From your idea to our first conversation.'])}
        </div>
        <div id="letter-body">
          <h3 class="letter-greeting">${t(['مرحباً فريق وصول،', 'Dear Wosul,'])}</h3>
          ${letterFields()}
          <div class="letter-signoff">
            <p>${t(['مع التحية،', 'Best,'])}<b id="letter-signature">${t(['اسمك هنا', 'Your name here'])}</b></p>
            <span class="mono">WOSUL / FIRST CONTACT</span>
          </div>
          <div class="letter-submit">
            <button id="send-inquiry" class="btn blue" type="submit">
              <span id="send-label" data-ar="أرسل الرسالة" data-en="Send my letter">أرسل الرسالة</span>${arrow}
            </button>
            <div class="letter-progress">
              <span id="letter-progress-text">${t(['٠ من ٤ حقول أساسية', '0 of 4 essentials complete'])}</span>
              <span class="letter-progress-bar" aria-hidden="true"><i id="letter-progress-fill"></i></span>
            </div>
          </div>
          <p class="letter-privacy">${t([
            'الحقول المعلّمة بـ * أساسية. سنستخدم بياناتك للتواصل بخصوص مشروعك.',
            'Fields marked * are required. We’ll use your details to contact you about your project.',
          ])}</p>
          <p id="inquiry-status" class="letter-request-status" role="status" aria-live="polite"></p>
          <noscript><p class="letter-privacy">${t(['فعّل JavaScript لإرسال الرسالة.', 'Enable JavaScript to send your letter.'])}</p></noscript>
        </div>
        <div id="inquiry-success" class="letter-success" hidden tabindex="-1">
          <span class="letter-success-icon" aria-hidden="true">${checkIcon}</span>
          <h3>${t(['وصلت رسالتك.', 'Your letter has arrived.'])}</h3>
          <p>${t([
            'حُفظ طلبك لدى وصول مع بيانات التواصل. سنراجع الفكرة، ونتواصل معك على الرقم أو البريد الذي تركته.',
            'Your inquiry and contact details have been saved with Wosul. We’ll review your idea and get in touch using the phone or email you provided.',
          ])}</p>
          <span id="inquiry-reference" class="mono"></span>
          <button class="btn small" id="new-inquiry" type="button">${t(['اكتب رسالة جديدة', 'Write another letter'])}</button>
        </div>
      </form>
    </section>
  `;
}

function letterFields(): string {
  const { fullName, company, email, context, brief } = LIMITS;
  return html`
    <div class="letter-identity">
      ${field(
        'fullName',
        ['أنا اسمي *', 'My name is *'],
        `<input id="fullName" name="fullName" required minlength="${fullName.min}" maxlength="${fullName.max}" autocomplete="name" ${placeholder(['اسمك الكامل', 'Your full name'])} aria-describedby="fullName-error">`,
      )}
      ${field(
        'company',
        ['وأعمل في / على', 'I work at / on'],
        `<input id="company" name="company" maxlength="${company.max}" autocomplete="organization" ${placeholder(['اسم الشركة أو المشروع — اختياري', 'Company or project — optional'])} aria-describedby="company-error">`,
      )}
    </div>
    <div class="letter-contact">
      ${field(
        'phone',
        ['تواصلوا معي على واتساب / الهاتف *', 'Reach me on WhatsApp / phone *'],
        '<input id="phone" name="phone" type="tel" inputmode="tel" required maxlength="32" autocomplete="tel" dir="ltr" placeholder="+971 50 123 4567" aria-describedby="phone-help phone-error">',
        help('phone-help', [
          'مع رمز الدولة، مثل ‎+971 للإمارات.',
          'Include the country code, for example +971 for the UAE.',
        ]),
      )}
      ${field(
        'email',
        ['أو على بريدي الإلكتروني', 'Or by email'],
        `<input id="email" name="email" type="email" inputmode="email" maxlength="${email.max}" autocomplete="email" dir="ltr" placeholder="you@company.com" aria-describedby="email-help email-error">`,
        help('email-help', ['اختياري؛ أضفه إذا تفضّل التواصل بالإيميل.', 'Optional; add it if you prefer email.']),
      )}
    </div>
    <fieldset class="letter-options" id="services-group" aria-describedby="services-error">
      <legend>${t(['أحتاج مساعدتكم في… *', 'I’d like your help with… *'])}</legend>
      <div class="letter-choices">
        ${services.map(
          (service) => html`
            <label class="letter-choice">
              <input type="checkbox" name="service" value="${service.id}">
              <span>${serviceIcon(service.id)}${t(service.name)}</span>
            </label>
          `,
        )}
      </div>
      <span class="field-error" id="services-error" data-error-for="services"></span>
    </fieldset>
    <div class="letter-context" id="letter-context" hidden>
      ${field(
        'context',
        ['عن نشاطي باختصار', 'A little context'],
        `<input id="context" name="context" maxlength="${context.max}" aria-describedby="context-error">`,
      )}
    </div>
    ${field(
      'brief',
      ['والفكرة هي… *', 'Here’s what I have in mind… *'],
      `<textarea id="brief" name="brief" required minlength="${brief.min}" maxlength="${brief.max}" rows="4" ${placeholder(['ما الذي تريد بناءه أو تحسينه؟ ومن سيستخدمه؟', 'What would you like to build or improve, and who will use it?'])} aria-describedby="brief-error brief-count"></textarea><div class="brief-count" id="brief-count">0 / ${brief.max}</div>`,
    )}
    <fieldset class="letter-options">
      <legend>${t(['أفضل نبدأ…', 'Ideally, we’d start…'])} <span class="field-optional">${t(['(اختياري)', '(optional)'])}</span></legend>
      <div class="letter-choices">
        ${TIMELINES.map(
          (timeline) => html`
            <label class="letter-choice">
              <input type="radio" name="timeline" value="${timeline.id}">
              <span>${t(timeline.label)}</span>
            </label>
          `,
        )}
      </div>
    </fieldset>
    <div class="letter-honeypot" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
  `;
}
