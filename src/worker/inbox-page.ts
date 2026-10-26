/** HTML for the private /inbox page. Every stored value is escaped. */
import { TIMELINES } from '../shared/catalog.ts';
import { escapeHtml as e } from '../shared/html.ts';
import type { InquiryRow } from './database.ts';

const SERVICE_NAMES: Record<string, string> = {
  booking: 'أنظمة الحجوزات',
  crm: 'إدارة العملاء CRM',
  web: 'موقع إلكتروني',
  app: 'تطبيق موبايل',
};
const TIMELINE_NAMES: Record<string, string> = Object.fromEntries(TIMELINES.map(({ id, label }) => [id, label[0]]));

// Times are shown in UAE time, where the team works.
const dateFormat = new Intl.DateTimeFormat('ar-AE', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Dubai',
});

function parseServices(json: string): string[] {
  try {
    const value: unknown = JSON.parse(json);
    return Array.isArray(value) ? value.map(String) : [];
  } catch {
    return [];
  }
}

function entry(row: InquiryRow): string {
  const phone = String(row.phone ?? '').replace(/[^+\d]/g, '');
  const tags = parseServices(row.services).map((id) => `<span>${e(SERVICE_NAMES[id] ?? id)}</span>`);
  const email = row.email
    ? `<a dir="ltr" href="mailto:${e(encodeURIComponent(row.email).replace('%40', '@'))}">${e(row.email)}</a>`
    : '';
  return [
    '<article class="entry">',
    `<div class="top"><span class="ref">WOSUL / ${e(row.id.slice(0, 8).toUpperCase())}</span><time>${e(dateFormat.format(new Date(row.created_at)))}</time></div>`,
    `<h2>${e(row.full_name)}</h2>`,
    `<p class="company">${e(row.company || 'مشروع شخصي / لم يحدّد شركة')}</p>`,
    `<div class="tags">${tags.join('')}</div>`,
    `<p class="brief">${e(row.brief)}</p>`,
    row.context ? `<p class="context">${e(row.context)}</p>` : '',
    `<div class="details"><span>بداية المشروع: ${e(TIMELINE_NAMES[row.timeline] ?? 'لم يحدّد')}</span><span>لغة الطلب: ${row.language === 'en' ? 'English' : 'العربية'}</span></div>`,
    '<div class="contact">',
    `<a dir="ltr" href="tel:${e(phone)}">${e(phone)}</a>`,
    `<a href="https://wa.me/${e(phone.replace('+', ''))}" target="_blank" rel="noopener noreferrer">فتح واتساب</a>`,
    email,
    '</div>',
    '</article>',
  ].join('');
}

const emptyState =
  '<section class="entry empty"><h2>بانتظار أول رسالة.</h2><p>ستظهر الطلبات الجديدة هنا مع الاسم والرقم والخدمات وتفاصيل المشروع.</p><a href="/#start">فتح نموذج التواصل</a></section>';

export function renderInboxPage(rows: InquiryRow[]): string {
  return [
    '<!doctype html><html lang="ar" dir="rtl"><head>',
    '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
    '<meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#080b10">',
    '<title>صندوق الطلبات | وصول</title>',
    '<link rel="icon" type="image/svg+xml" href="/images/wosul-icon.svg"><link rel="stylesheet" href="/inbox.css">',
    '</head><body>',
    '<header><a href="/"><img src="/images/wosul-wordmark-dark.svg" alt="Wosul وصول"></a><a href="/">العودة للموقع</a></header>',
    '<main><h1>صندوق الطلبات</h1>',
    `<p class="sub">${rows.length} من أحدث الطلبات · المواعيد بتوقيت الإمارات</p>`,
    rows.length ? rows.map(entry).join('') : emptyState,
    '</main></body></html>',
  ].join('');
}
