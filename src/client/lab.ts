/**
 * Lab page: four small interactive concept demos with sample data.
 * Nothing is sent anywhere; all state lives in this page view.
 */
import { isServiceId, SERVICE_SLUGS } from '../shared/catalog.ts';
import type { ServiceId } from '../shared/catalog.ts';
import { arrowIcon } from '../shared/icons.ts';
import { element, elements, LANGUAGE_CHANGE, tr } from './dom.ts';

type Role = 'owner' | 'staff' | 'client';
type DemoService = 'consultation' | 'followup';
type Day = 'tomorrow' | 'later';

interface Lead {
  id: string;
  ar: string;
  en: string;
  stage: number;
  assigned: boolean;
}

const TIMES = ['10:00', '11:30', '13:00', '15:00'];
const DAYS: Day[] = ['tomorrow', 'later'];
const ROLES: [Role, string, string][] = [
  ['owner', 'الإدارة', 'Owner'],
  ['staff', 'الفريق', 'Team'],
  ['client', 'العميل', 'Customer'],
];
const CRM_STAGE_COUNT = 3;

const requested = new URLSearchParams(location.search).get('demo');
let demo: ServiceId = isServiceId(requested) ? requested : 'booking';
let role: Role = 'owner';

const state = {
  booking: {
    service: 'consultation' as DemoService,
    day: 'tomorrow' as Day,
    time: '11:30',
    records: [] as { service: DemoService; day: Day; time: string }[],
    confirmed: false,
  },
  crm: {
    selected: '01',
    leads: [
      { id: '01', ar: 'استفسار عن خدمة', en: 'Service inquiry', stage: 0, assigned: true },
      { id: '02', ar: 'طلب عرض مشروع', en: 'Project proposal request', stage: 1, assigned: true },
      { id: '03', ar: 'موعد استشارة', en: 'Consultation request', stage: 2, assigned: false },
    ] as Lead[],
  },
  app: { service: 'consultation' as DemoService, step: 0 },
  web: { view: 'home' as 'home' | 'services' },
};

// ---------------------------------------------------------------- helpers

const number = (i: number) => String(i + 1).padStart(2, '0');

const actionButton = (text: string, action: string) =>
  `<button type="button" class="demo-button" data-action="${action}">${text}</button>`;

const serviceChoices = (): [DemoService, string][] => [
  ['consultation', tr('استشارة', 'Consultation')],
  ['followup', tr('متابعة', 'Follow-up')],
];

const serviceLabel = (id: DemoService) => serviceChoices().find(([value]) => value === id)![1];

const dayLabel = (day: Day) =>
  day === 'tomorrow'
    ? tr('غداً — يوم تجريبي', 'Tomorrow — sample day')
    : tr('بعد غد — يوم تجريبي', 'In two days — sample day');

const selectedLead = () => state.crm.leads.find((lead) => lead.id === state.crm.selected)!;

// ---------------------------------------------------------------- demos

function bookingDemo(): string {
  const booking = state.booking;
  const taken = booking.records.filter((record) => record.day === booking.day).map((record) => record.time);
  const times = TIMES.filter((time) => !taken.includes(time));
  if (!times.includes(booking.time)) booking.time = times[0] ?? '';

  const form = `<form id="demo-booking" class="demo-booking-form"><h3>${tr('موعدك، بخطوات واضحة.', 'Your appointment, clearly arranged.')}</h3><label>${tr('الخدمة', 'Service')}<select name="demo-service">${serviceChoices()
    .map(
      ([value, label]) => `<option value="${value}"${value === booking.service ? ' selected' : ''}>${label}</option>`,
    )
    .join('')}</select></label><label>${tr('اليوم', 'Day')}<select name="demo-day">${DAYS.map(
    (day) => `<option value="${day}"${day === booking.day ? ' selected' : ''}>${dayLabel(day)}</option>`,
  ).join('')}</select></label><div><p>${tr('الوقت المتاح', 'Available time')}</p><div class="time-options">${
    times
      .map(
        (time) =>
          `<button type="button" data-time="${time}" aria-pressed="${booking.time === time}" dir="ltr">${time}</button>`,
      )
      .join('') || tr('اكتملت الأوقات التجريبية لهذا اليوم.', 'No slots remain on this sample day.')
  }</div></div><button type="submit" class="demo-button"${booking.time ? '' : ' disabled'}>${tr('أضف حجزاً تجريبياً', 'Add a sample booking')} ${arrowIcon}</button><p class="small-copy">${tr('لن يُرسل تأكيد أو يُنشأ موعد حقيقي.', 'No confirmation is sent and no real appointment is created.')}</p></form>`;

  if (role === 'client') {
    const confirmed = booking.confirmed
      ? `<p class="demo-status" role="status">✓ ${tr('تم تأكيد الحجز التجريبي.', 'Sample booking confirmed.')}</p>`
      : '';
    return `<div class="demo-booking-layout">${form}<div class="demo-owner-note"><span class="mono">CUSTOMER VIEW</span><h3>${tr('من اختيار الخدمة، إلى وقت محدّد.', 'From choosing a service to a clear time.')}</h3><p>${tr('يختفي الوقت المحجوز من الأوقات المتاحة في هذه الجلسة.', 'A booked time disappears from availability in this session.')}</p>${confirmed}</div></div>`;
  }

  const records = booking.records.length
    ? booking.records
        .map(
          (record, i) =>
            `<article class="booking-record"><span class="mono">${number(i)} / SAMPLE</span><h4>${serviceLabel(record.service)}</h4><p>${dayLabel(record.day)} · <b dir="ltr">${record.time}</b></p><span>${tr('عميل تجريبي · مؤكّد في النموذج', 'Sample customer · confirmed in demo')}</span></article>`,
        )
        .join('')
    : `<div class="demo-owner-note">${tr('لا حجوزات بعد. أضف حجزاً لتراه هنا، ثم بدّل إلى عرض الفريق.', 'No bookings yet. Add one, then switch to the team view.')}</div>`;
  const listTitle = role === 'staff' ? tr('جدول الفريق', 'Team schedule') : tr('الحجوزات التجريبية', 'Sample bookings');
  return `<div class="demo-booking-layout">${form}<div><h3 class="demo-list-title">${listTitle}</h3>${records}</div></div>`;
}

function crmDemo(): string {
  const { leads, selected } = state.crm;
  const stages = [
    tr('استفسار جديد', 'New inquiry'),
    tr('قيد المتابعة', 'In conversation'),
    tr('موعد محدّد', 'Meeting booked'),
  ];
  const visible =
    role === 'staff'
      ? leads.filter((lead) => lead.assigned)
      : role === 'client'
        ? leads.filter((lead) => lead.id === selected)
        : leads;
  const current = selectedLead();
  const scope = role === 'client' ? 'CUSTOMER STATUS' : role === 'staff' ? 'ASSIGNED TO TEAM' : 'ALL SAMPLE INQUIRIES';

  const columns = stages
    .map((title, stage) => {
      const inStage = visible.filter((lead) => lead.stage === stage);
      const cards = inStage
        .map(
          (lead) =>
            `<button type="button" class="demo-lead${lead.id === selected ? ' selected' : ''}" data-lead="${lead.id}" aria-pressed="${lead.id === selected}"><small>SAMPLE / ${lead.id}</small><strong>${tr(lead.ar, lead.en)}</strong><span>${lead.assigned ? tr('المسؤول: فريق وصول', 'Owner: Wosul team') : tr('المسؤول: الإدارة', 'Owner: management')}</span></button>`,
        )
        .join('');
      return `<section class="demo-column"><h4>${title}<span>${inStage.length}</span></h4>${cards}</section>`;
    })
    .join('');

  const advance =
    role === 'client'
      ? ''
      : actionButton(
          current.stage < CRM_STAGE_COUNT - 1
            ? tr('انقل إلى المرحلة التالية', 'Move to next stage')
            : tr('أعد إلى الاستفسارات', 'Return to new inquiries'),
          'advance-lead',
        );
  const note =
    role === 'client'
      ? tr('يعرض العميل حالة طلبه فقط في هذا التصوّر.', 'This customer view shows only the selected request’s status.')
      : role === 'staff'
        ? tr(
            'الفريق يرى الاستفسارات المسندة إليه. اختَر بطاقة ثم غيّر مرحلتها.',
            'The team sees assigned inquiries. Select a card, then move it to the next stage.',
          )
        : tr(
            'الإدارة ترى جميع الاستفسارات التجريبية ومراحلها.',
            'The owner sees all sample inquiries and their stages.',
          );

  return `<div class="demo-owner-summary"><h3>${tr('كل متابعة لها خطوة قادمة.', 'Every follow-up has a next step.')}</h3><span class="mono">${scope}</span></div><div class="demo-columns">${columns}</div><div class="lead-actions"><p>${tr('المحدّد: ', 'Selected: ')}<b>${tr(current.ar, current.en)}</b></p>${advance}${actionButton(tr('إعادة ضبط النموذج', 'Reset concept'), 'reset-crm')}</div><p class="small-copy">${note}</p>`;
}

function appDemo(): string {
  const app = state.app;
  let screen: string;
  if (app.step === 0) {
    const options = serviceChoices()
      .map(
        ([id, label]) =>
          `<button type="button" class="phone-service" data-phone-service="${id}">${label}<span>${arrowIcon}</span></button>`,
      )
      .join('');
    screen = `<h3>${tr('ماذا تريد أن تنجز؟', 'What would you like to do?')}</h3><p>${tr('اختَر خدمة لتجربة رحلة قصيرة.', 'Choose a service to try a short journey.')}</p>${options}`;
  } else if (app.step === 1) {
    screen = `<h3>${serviceLabel(app.service)}</h3><p>${tr('راجع الخدمة، ثم أنشئ طلباً تجريبياً.', 'Review the service, then create a sample request.')}</p><div class="phone-service">${tr('النوع', 'Type')}<b>${serviceLabel(app.service)}</b></div>${actionButton(tr('تأكيد الطلب التجريبي', 'Confirm sample request'), 'confirm-app')}${actionButton(tr('الرجوع', 'Go back'), 'reset-app')}`;
  } else {
    screen = `<div class="phone-success">✓</div><h3>${tr('خطوة واضحة.', 'A clear next step.')}</h3><p role="status">${tr('تم إنشاء طلب توضيحي في هذه الجلسة فقط.', 'An illustrative request was created for this session only.')}</p>${actionButton(tr('جرّب من البداية', 'Try again'), 'reset-app')}`;
  }

  const perspective =
    role === 'owner'
      ? tr(
          'زاوية الإدارة: كيف تصل الطلبات ومن يتابعها؟',
          'Owner perspective: where do requests arrive, and who follows up?',
        )
      : role === 'staff'
        ? tr(
            'زاوية الفريق: كيف يستلم الموظف طلباته وبأي صلاحيات؟',
            'Team perspective: how do staff receive requests, and with which permissions?',
          )
        : tr(
            'زاوية العميل: مهمّة محدّدة، وخطوة تالية مفهومة.',
            'Customer perspective: a defined task and an understandable next step.',
          );

  return `<div class="demo-phone-area"><div class="interactive-phone"><span class="phone-step mono">WOSUL / SERVICE · ${number(app.step)}</span>${screen}</div><div class="phone-description"><span class="mono">MOBILE EXPERIENCE / CONCEPT</span><h3>${tr('اختبر الرحلة قبل توسيع الوظائف.', 'Explore the journey before expanding features.')}</h3><p>${tr('نموذج ويب يشرح شاشات تطبيق محتمل: اختيار خدمة، مراجعة، وتأكيد. التصميم والوظائف الفعلية تتحدّد للمشروع.', 'A web concept explaining a potential app flow: choose, review and confirm. Actual design and features are scoped for the project.')}</p><p class="demo-owner-note">${perspective}</p></div></div>`;
}

function webDemo(): string {
  const home = state.web.view === 'home';
  const heading = home
    ? tr('مساحة أوضح.<br>فكرة أقرب.', 'A clearer space.<br>A closer idea.')
    : tr('خدمات بتفاصيل<br>تساعدك تختار.', 'Services explained.<br>Decisions made clearer.');
  const text = home
    ? tr(
        'واجهة لاستوديو افتراضي. بنية بسيطة تقود من التعرّف إلى الخدمة.',
        'A fictional studio concept. A clear structure leads from introduction to service.',
      )
    : tr('التصميم الداخلي · تخطيط المساحات · استشارة أولية', 'Interior design · Space planning · Initial consultation');
  const next = home
    ? actionButton(tr('استكشف الخدمات', 'Explore services'), 'web-services')
    : actionButton(tr('العودة إلى البداية', 'Back to the start'), 'web-home');

  return `<div class="demo-web-stage"><div class="window-bar" dir="ltr"><b>FORM. / WEBSITE CONCEPT</b><span>RESPONSIVE EXPERIENCE</span></div><div class="website-canvas"><nav><b>FORM.</b><div>${actionButton(tr('الرئيسية', 'Home'), 'web-home')}${actionButton(tr('الخدمات', 'Services'), 'web-services')}</div></nav><h3>${heading}</h3><p>${text}</p><div class="web-sculpture"></div>${next}</div></div><p class="small-copy">${tr('جرّب التنقل. FORM اسم افتراضي لعرض الفكرة، وليس عميل وصول.', 'Try navigating. FORM is fictional and is not a Wosul client.')}</p>`;
}

const demos: Record<ServiceId, () => string> = { booking: bookingDemo, crm: crmDemo, app: appDemo, web: webDemo };

// ---------------------------------------------------------------- rendering

const panel = element('#lab-panel');
const explainer = element('#lab-explainer');
const tabs = elements<HTMLButtonElement>('.lab-tabs button');

/** Identifies the focused control so focus survives a re-render. */
function focusedControlSelector(): string | null {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement) || !panel.contains(active)) return null;
  for (const key of ['role', 'time', 'lead', 'phoneService', 'action'] as const) {
    const value = active.dataset[key];
    if (value) return `[data-${key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}="${value}"]`;
  }
  if (active instanceof HTMLSelectElement) return `select[name="${active.name}"]`;
  return null;
}

function render(): void {
  const focused = focusedControlSelector();

  for (const tab of tabs) {
    const selected = tab.dataset.demo === demo;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  }
  panel.setAttribute('aria-labelledby', `lab-tab-${demo}`);

  const roleButtons = ROLES.map(
    ([id, ar, en]) => `<button type="button" data-role="${id}" aria-pressed="${role === id}">${tr(ar, en)}</button>`,
  ).join('');
  panel.innerHTML = `<div class="lab-panel-toolbar"><span class="mono">WOSUL / ${demo.toUpperCase()} / SAMPLE DATA</span><div class="role-buttons" role="group" aria-label="${tr('زاوية العرض', 'View as')}">${roleButtons}</div></div><div class="demo-body">${demos[demo]()}</div>`;
  explainer.innerHTML = `<p>${tr('تغييراتك تبقى في الصفحة. للنظام الفعلي، نحدّد المتطلبات والبيانات والصلاحيات والربط معك.', 'Changes stay on this page. For a real system, we agree requirements, data, permissions and integrations together.')}</p><a class="text-link" href="/services/${SERVICE_SLUGS[demo]}/">${tr('تعرّف على الخدمة', 'Explore the service')} ${arrowIcon}</a>`;

  if (focused) panel.querySelector<HTMLElement>(focused)?.focus();
}

// ---------------------------------------------------------------- events

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => {
    if (!isServiceId(tab.dataset.demo)) return;
    demo = tab.dataset.demo;
    render();
    history.replaceState(null, '', `?demo=${demo}`);
  });
  // Arrow keys move between tabs in reading direction (reversed for Arabic).
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const rtl = document.documentElement.dir === 'rtl';
    const step = (event.key === 'ArrowLeft') === rtl ? 1 : -1;
    const next =
      event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + step + tabs.length) % tabs.length;
    tabs[next].click();
    tabs[next].focus();
  });
});

panel.addEventListener('click', (event) => {
  const button = event.target instanceof Element ? event.target.closest('button') : null;
  if (!button) return;
  const { dataset } = button;

  if (dataset.role) {
    role = dataset.role as Role;
    // The team only sees assigned leads, so keep the selection visible to them.
    if (role === 'staff' && !selectedLead().assigned) {
      state.crm.selected = state.crm.leads.find((lead) => lead.assigned)!.id;
    }
  } else if (dataset.time) {
    state.booking.time = dataset.time;
  } else if (dataset.lead) {
    state.crm.selected = dataset.lead;
  } else if (dataset.phoneService) {
    state.app.service = dataset.phoneService as DemoService;
    state.app.step = 1;
  } else {
    switch (dataset.action) {
      case 'advance-lead': {
        const lead = selectedLead();
        lead.stage = (lead.stage + 1) % CRM_STAGE_COUNT;
        break;
      }
      case 'reset-crm':
        state.crm.leads.forEach((lead, i) => (lead.stage = i));
        state.crm.selected = '01';
        break;
      case 'confirm-app':
        state.app.step = 2;
        break;
      case 'reset-app':
        state.app.step = 0;
        break;
      case 'web-home':
        state.web.view = 'home';
        break;
      case 'web-services':
        state.web.view = 'services';
        break;
      default:
        return; // e.g. the booking form's submit button, handled below
    }
  }
  render();
});

panel.addEventListener('change', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLSelectElement)) return;
  if (target.name === 'demo-service') state.booking.service = target.value as DemoService;
  if (target.name === 'demo-day') state.booking.day = target.value as Day;
  render();
});

panel.addEventListener('submit', (event) => {
  if (!(event.target instanceof HTMLFormElement) || event.target.id !== 'demo-booking') return;
  event.preventDefault();
  const booking = state.booking;
  if (!booking.time) return;
  booking.records.push({ service: booking.service, day: booking.day, time: booking.time });
  booking.confirmed = true;
  render();
});

document.addEventListener(LANGUAGE_CHANGE, render);
render();
