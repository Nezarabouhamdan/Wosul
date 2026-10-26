/**
 * Home page contact form. Validates with the same rules as the server,
 * sends the letter to /api/inquiries and shows a receipt.
 */
import { isServiceId } from '../shared/catalog.ts';
import type { Bilingual, ServiceId } from '../shared/catalog.ts';
import { createSubmissionId, isValidPhone, LIMITS, validateInquiry } from '../shared/inquiry.ts';
import type { InquiryErrors, InquiryField } from '../shared/inquiry.ts';
import { currentLanguage, element, elements, LANGUAGE_CHANGE, tr } from './dom.ts';

const REQUEST_TIMEOUT_MS = 20_000;
const FORM_TOKEN_HEADER = 'X-Wosul-Form-Token';

const STATUS_MESSAGES = {
  validation: ['راجع الحقول الموضّحة حتى نكمل رسالتك.', 'Please review the highlighted fields.'],
  request: [
    'تعذّر تأكيد الإرسال. بياناتك ما زالت في الحقول؛ جرّب مجدداً.',
    'We couldn’t confirm delivery. Your details are still here; please try again.',
  ],
  rate: [
    'وصلتنا عدة محاولات خلال وقت قصير. جرّب مجدداً بعد قليل.',
    'We received several attempts in a short time. Please try again a little later.',
  ],
} satisfies Record<string, Bilingual>;
type StatusKind = keyof typeof STATUS_MESSAGES;

const FIELD_ERRORS: Partial<Record<InquiryField, Bilingual>> = {
  fullName: ['اكتب اسمك الكامل، من حرفين على الأقل.', 'Please enter your name (at least 2 characters).'],
  company: ['اسم الشركة طويل؛ اختصره إلى 160 حرفاً.', 'Please keep the company name under 160 characters.'],
  phone: [
    'أضف رقماً صحيحاً مع رمز الدولة، مثل ‎+971 50 123 4567.',
    'Include a valid country code, for example +971 50 123 4567.',
  ],
  email: ['راجع عنوان البريد الإلكتروني.', 'Please check the email address.'],
  services: ['اختَر خدمة واحدة على الأقل.', 'Choose at least one service.'],
  context: ['اختصر هذه الإجابة إلى 400 حرف.', 'Please keep this answer under 400 characters.'],
  brief: ['احكِ لنا عن الفكرة في 8 أحرف على الأقل، وحتى 1800 حرف.', 'Tell us a little more (8–1800 characters).'],
};

/** The optional context question adapts when exactly one service is chosen: [label, placeholder]. */
const CONTEXT_QUESTIONS: Record<ServiceId | 'default', [Bilingual, Bilingual]> = {
  booking: [
    ['ما نوع النشاط وعدد الفروع؟', 'What kind of business, and how many locations?'],
    ['مثلاً: عيادة تجميل، فرعان — اختياري', 'For example: a beauty clinic, two locations — optional'],
  ],
  crm: [
    ['كيف تتابعون العملاء حالياً؟', 'How do you currently follow up with customers?'],
    ['مثلاً: فريق من 5 أشخاص يستخدم Excel — اختياري', 'For example: a team of five using spreadsheets — optional'],
  ],
  web: [
    ['هل عندك موقع حالي؟', 'Do you have an existing website?'],
    ['رابط الموقع أو «موقع جديد» — اختياري', 'Website address, or “a new website” — optional'],
  ],
  app: [
    ['مين رح يستخدم التطبيق؟', 'Who will use the app?'],
    ['العملاء، فريق العمل، أو كلاهما — اختياري', 'Customers, your team, or both — optional'],
  ],
  default: [
    ['عن نشاطي باختصار', 'A little business context'],
    ['نوع النشاط وحجمه — اختياري', 'Business type and size — optional'],
  ],
};

const BRIEF_PLACEHOLDERS: Record<ServiceId | 'default', Bilingual> = {
  booking: [
    'كيف تريد إدارة الخدمات، الأوقات والحجوزات؟',
    'How would you like to manage services, availability and bookings?',
  ],
  crm: [
    'ما الذي يضيع اليوم في متابعة العملاء، وما الذي تريد ترتيبه؟',
    'What gets lost in customer follow-up, and what would you like to organise?',
  ],
  web: [
    'ماذا تقدم شركتك، وما الخطوة التي تريد من الزائر أن يأخذها؟',
    'What does your company offer, and what should a visitor do next?',
  ],
  app: [
    'ما المهمة الأساسية التي تريد تسهيلها للمستخدم؟',
    'What is the main task you want to make easier for the user?',
  ],
  default: [
    'ما الذي تريد بناءه أو تحسينه؟ ومن سيستخدمه؟',
    'What would you like to build or improve, and who will use it?',
  ],
};

class RequestError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(`Inquiry request failed with status ${status}`);
    this.status = status;
  }
}

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function setUpContactForm(form: HTMLFormElement): void {
  const field = <T extends HTMLElement = HTMLInputElement>(selector: string) => element<T>(selector, form);
  const letterBody = field<HTMLElement>('#letter-body');
  const success = field<HTMLElement>('#inquiry-success');
  const status = field<HTMLElement>('#inquiry-status');
  const servicesGroup = field<HTMLFieldSetElement>('#services-group');
  const contextBox = field<HTMLElement>('#letter-context');
  const contextLabel = field<HTMLElement>('#letter-context .letter-field > span:first-child');
  const contextInput = field('#context');
  const briefInput = field<HTMLTextAreaElement>('#brief');

  let submissionId = createSubmissionId();
  let lastFingerprint = '';
  let busy = false;
  let sessionToken: Promise<string> | null = null;

  function readValues() {
    return {
      fullName: field('#fullName').value,
      company: field('#company').value,
      phone: field('#phone').value,
      email: field('#email').value,
      services: elements<HTMLInputElement>('[name=service]:checked', form).map((box) => box.value),
      context: contextInput.value,
      brief: briefInput.value,
      timeline: form.querySelector<HTMLInputElement>('[name=timeline]:checked')?.value ?? '',
      language: currentLanguage(),
      submissionId,
      website: (form.elements.namedItem('website') as HTMLInputElement).value,
    };
  }

  function setStatus(kind?: StatusKind): void {
    if (kind) {
      status.dataset.kind = kind;
      status.textContent = tr(...STATUS_MESSAGES[kind]);
    } else {
      status.textContent = '';
      delete status.dataset.kind;
    }
  }

  /** Keeps the adaptive prompts, signature, character count and progress bar in sync. */
  function update(): void {
    const values = readValues();
    const single = values.services.length === 1 ? values.services[0] : undefined;
    const prompt = isServiceId(single) ? single : 'default';

    contextBox.hidden = values.services.length === 0;
    const [label, hint] = CONTEXT_QUESTIONS[prompt];
    contextLabel.textContent = tr(...label);
    contextInput.placeholder = tr(...hint);
    briefInput.placeholder = tr(...BRIEF_PLACEHOLDERS[prompt]);
    field('#brief-count').textContent = `${values.brief.length} / ${LIMITS.brief.max}`;
    field('#letter-signature').textContent = values.fullName.trim() || tr('اسمك هنا', 'Your name here');

    const essentialsDone = [
      values.fullName.trim().length >= LIMITS.fullName.min,
      isValidPhone(values.phone),
      values.services.length > 0,
      values.brief.trim().length >= LIMITS.brief.min,
    ].filter(Boolean).length;
    field('#letter-progress-text').textContent = tr(
      `${essentialsDone} من 4 حقول أساسية`,
      `${essentialsDone} of 4 essentials complete`,
    );
    field('#letter-progress-fill').style.width = `${essentialsDone * 25}%`;

    field('#send-label').textContent = busy
      ? tr('جارٍ إرسال رسالتك…', 'Sending your letter…')
      : tr('أرسل الرسالة', 'Send my letter');
    if (status.dataset.kind === 'validation' && validateInquiry(values).valid) setStatus();
  }

  function showErrors(errors: InquiryErrors, focusFirst = false): void {
    for (const slot of elements('[data-error-for]', form)) {
      const name = slot.dataset.errorFor as InquiryField;
      const message = name in errors ? FIELD_ERRORS[name] : undefined;
      slot.textContent = message ? tr(...message) : '';
      const target = name === 'services' ? servicesGroup : form.elements.namedItem(name);
      if (target instanceof Element) {
        if (message) target.setAttribute('aria-invalid', 'true');
        else target.removeAttribute('aria-invalid');
      }
    }
    if (focusFirst) {
      const invalid = form.querySelector<HTMLElement>('[aria-invalid=true]');
      (invalid instanceof HTMLFieldSetElement ? invalid.querySelector('input') : invalid)?.focus();
    }
  }

  /** Re-translates the error messages already on screen, without flagging new fields. */
  function refreshShownErrors(): void {
    const { errors } = validateInquiry(readValues());
    const shown: InquiryErrors = {};
    for (const el of elements<HTMLInputElement | HTMLFieldSetElement>('[aria-invalid=true]', form)) {
      const name = (el === servicesGroup ? 'services' : el.name) as InquiryField;
      if (errors[name]) shown[name] = errors[name];
    }
    showErrors(shown);
  }

  /** CSRF protection: the server pairs this token with an HttpOnly cookie. */
  function getSessionToken(refresh = false): Promise<string> {
    if (refresh) sessionToken = null;
    sessionToken ??= fetchWithTimeout('/api/form-session', { credentials: 'same-origin', cache: 'no-store' })
      .then(async (response) => {
        const data: { token?: string } = response.ok ? await response.json() : {};
        if (!data.token) throw new RequestError(response.status);
        return data.token;
      })
      .catch((error: unknown) => {
        sessionToken = null;
        throw error;
      });
    return sessionToken;
  }

  function setBusy(value: boolean): void {
    busy = value;
    form.setAttribute('aria-busy', String(value));
    for (const control of elements<HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement>(
      'input,textarea,button',
      form,
    )) {
      control.disabled = value;
    }
    update();
  }

  async function submit(): Promise<void> {
    let values = readValues();
    // An unchanged letter is a retry and keeps its id, so it is never stored twice.
    const fingerprint = JSON.stringify({ ...values, submissionId: '' });
    if (lastFingerprint && lastFingerprint !== fingerprint) {
      submissionId = createSubmissionId();
      values = readValues();
    }

    const checked = validateInquiry(values);
    showErrors(checked.errors, !checked.valid);
    if (!checked.valid) {
      setStatus('validation');
      return;
    }

    lastFingerprint = fingerprint;
    setStatus();
    setBusy(true);
    try {
      const send = async (token: string) =>
        fetchWithTimeout('/api/inquiries', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', [FORM_TOKEN_HEADER]: token },
          body: JSON.stringify({ ...checked.data, website: values.website }),
        });
      let response = await send(await getSessionToken());
      // The form session may have expired: start a new one and retry once.
      if (response.status === 403) response = await send(await getSessionToken(true));

      const result: { id?: string; errors?: InquiryErrors } = await response.json().catch(() => ({}));
      if (!response.ok || !result.id) {
        if (result.errors) showErrors(result.errors, true);
        throw new RequestError(response.status);
      }

      letterBody.hidden = true;
      success.hidden = false;
      field('#inquiry-reference').textContent = `WOSUL / ${result.id.slice(0, 8).toUpperCase()}`;
      success.focus();
    } catch (error) {
      setStatus(error instanceof RequestError && error.status === 429 ? 'rate' : 'request');
    } finally {
      setBusy(false);
    }
  }

  function preselectService(id: string | undefined | null): void {
    if (!isServiceId(id)) return;
    const box = field(`input[name="service"][value="${id}"]`);
    box.checked = true;
    box.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Warm up the form session as soon as the visitor starts typing.
  form.addEventListener('focusin', () => getSessionToken().catch(() => {}), { once: true });
  // Once a field has been flagged, errors update live as the visitor corrects them.
  const revalidate = () => showErrors(validateInquiry(readValues()).errors);
  form.addEventListener('input', (event) => {
    update();
    const target = event.target as HTMLInputElement;
    if (target.name in FIELD_ERRORS && target.getAttribute('aria-invalid') === 'true') revalidate();
  });
  form.addEventListener('change', () => {
    update();
    if (servicesGroup.getAttribute('aria-invalid') === 'true') revalidate();
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!busy) void submit();
  });
  field<HTMLButtonElement>('#new-inquiry').addEventListener('click', () => {
    form.reset();
    submissionId = createSubmissionId();
    lastFingerprint = '';
    showErrors({});
    setStatus();
    success.hidden = true;
    letterBody.hidden = false;
    update();
    field('#fullName').focus();
  });
  document.addEventListener(LANGUAGE_CHANGE, () => {
    update();
    refreshShownErrors();
    const kind = status.dataset.kind as StatusKind | undefined;
    if (kind) setStatus(kind);
  });

  // "Discuss this scope" links and /?service=crm links preselect a service.
  for (const link of elements('[data-pick]')) {
    link.addEventListener('click', () => preselectService(link.dataset.pick));
  }
  preselectService(new URLSearchParams(location.search).get('service'));
  update();
}

const form = document.querySelector<HTMLFormElement>('#project-form');
if (form) setUpContactForm(form);
