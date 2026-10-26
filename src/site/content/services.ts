import { SERVICE_SLUGS } from '../../shared/catalog.ts';
import type { Bilingual, ServiceId } from '../../shared/catalog.ts';

export interface Service {
  id: ServiceId;
  slug: string;
  number: string;
  /** Label on the home page service card, e.g. "01 / BOOKING". */
  cardLabel: string;
  name: Bilingual;
  /** One line under the name in the header services menu. */
  menuSummary: Bilingual;
  tagline: Bilingual;
  description: Bilingual;
  /** Two key points listed on the home page card. */
  highlights: Bilingual[];
  audience: Bilingual;
  deliverables: Bilingual[];
  /** What gets agreed before the proposal is confirmed. */
  toAgree: Bilingual;
}

export const services: Service[] = [
  {
    id: 'booking',
    slug: SERVICE_SLUGS.booking,
    number: '01',
    cardLabel: 'BOOKING',
    name: ['أنظمة الحجوزات', 'Booking systems'],
    menuSummary: ['المواعيد، الأوقات المتاحة ولوحة الإدارة', 'Appointments, availability and admin'],
    tagline: ['الموعد واضح.<br>والتجربة أسهل.', 'A clearer booking.<br>A smoother experience.'],
    description: [
      'من اختيار الخدمة إلى متابعة الموعد. نصمّم رحلة الحجز حول أوقات فريقك وطريقة عمل نشاطك.',
      'From choosing a service to managing the appointment. We shape booking around your team’s availability and the way you work.',
    ],
    highlights: [
      ['الخدمات والأوقات المتاحة', 'Services & availability'],
      ['الحجوزات ولوحة الإدارة', 'Bookings & management'],
    ],
    audience: [
      'نشاط يعتمد على المواعيد، أو الخدمات المحجوزة مسبقاً.',
      'Businesses built around appointments or scheduled services.',
    ],
    deliverables: [
      ['رحلة حجز واضحة', 'A clear booking journey'],
      ['إدارة الخدمات والمدد والأوقات', 'Service, duration and availability settings'],
      ['لوحة لمراجعة الحجوزات وتعديلها', 'A dashboard to review and manage bookings'],
      ['صلاحيات الفريق بحسب النطاق', 'Team access based on the agreed scope'],
    ],
    toAgree: [
      'الفروع، عدد مقدّمي الخدمة، سياسات التعديل والإلغاء، التنبيهات، الدفع الإلكتروني، والربط المطلوب.',
      'Branches, service providers, rescheduling and cancellation rules, notifications, payments and integrations.',
    ],
  },
  {
    id: 'crm',
    slug: SERVICE_SLUGS.crm,
    number: '02',
    cardLabel: 'CRM',
    name: ['أنظمة إدارة العملاء', 'CRM systems'],
    menuSummary: ['العملاء، مراحل المتابعة ومهام الفريق', 'Contacts, pipelines and team tasks'],
    tagline: [
      'كل عميل له مسار.<br>وكل متابعة لها وقت.',
      'Every customer has a journey.<br>Every follow-up has a next step.',
    ],
    description: [
      'نرتّب بيانات العملاء، مراحل المتابعة والمهام، ونخصّص النظام ليخدم الفريق الذي يستخدمه كل يوم.',
      'We organise customer records, follow-up stages and tasks in a system shaped around the people who use it every day.',
    ],
    highlights: [
      ['العملاء ومراحل المتابعة', 'Contacts & pipelines'],
      ['المهام ومسؤوليات الفريق', 'Tasks & team ownership'],
    ],
    audience: [
      'فرق المبيعات وشركات الخدمات التي تحتاج وضوحاً أكبر في متابعة العملاء.',
      'Sales teams and service businesses that need clearer customer follow-up.',
    ],
    deliverables: [
      ['مراحل متابعة تناسب نشاطك', 'Pipeline stages that fit your business'],
      ['حقول وبيانات العملاء المتفق عليها', 'Agreed customer fields and records'],
      ['توزيع المسؤوليات والمهام', 'Ownership and task workflows'],
      ['تهيئة الاستخدام وشرح التسليم', 'Setup and a practical handover'],
    ],
    toAgree: [
      'هل نخصّص منصة قائمة مثل GoHighLevel أم نطوّر أداة خاصة؟ وما مصادر العملاء، البيانات القديمة، والصلاحيات والتقارير المطلوبة؟',
      'Should we configure an existing platform such as GoHighLevel or build a custom tool? We agree on lead sources, existing data, permissions and reporting.',
    ],
  },
  {
    id: 'web',
    slug: SERVICE_SLUGS.web,
    number: '03',
    cardLabel: 'WEBSITES',
    name: ['المواقع الإلكترونية', 'Websites'],
    menuSummary: ['حضور واضح يقود الزائر للتواصل', 'A clear presence that leads to contact'],
    tagline: [
      'حضور يشرحك.<br>وتجربة تستحق الزيارة.',
      'A presence that explains you.<br>An experience worth exploring.',
    ],
    description: [
      'مواقع تعرض خدماتك بوضوح، وتبدو متقنة على الموبايل، وتقود الزائر إلى الخطوة المناسبة.',
      'Websites that explain your services, feel considered on mobile and guide visitors to a meaningful next step.',
    ],
    highlights: [
      ['هيكل واضح وتجربة متجاوبة', 'Clear structure & responsive design'],
      ['صفحات الخدمة ومسار التواصل', 'Service pages & contact journeys'],
    ],
    audience: [
      'شركة تبدأ حضورها الرقمي، أو نشاط يحتاج إعادة تقديم خدماته بصورة أوضح.',
      'A business launching its online presence or ready to present its services more clearly.',
    ],
    deliverables: [
      ['هيكل صفحات متّفق عليه', 'An agreed page structure'],
      ['تصميم واجهات يناسب الهوية', 'Interface design that fits the brand'],
      ['تجربة متجاوبة للموبايل والكمبيوتر', 'Responsive mobile and desktop layouts'],
      ['نماذج وربط وتتبّع بحسب النطاق', 'Forms, integrations and tracking as scoped'],
    ],
    toAgree: [
      'الصفحات، اللغات، مصدر المحتوى والصور، لوحة إدارة المحتوى إن كانت مطلوبة، الاستضافة، وربط استقبال الاستفسارات.',
      'Pages, languages, copy and imagery, any required CMS, hosting and how inquiries will reach your team.',
    ],
  },
  {
    id: 'app',
    slug: SERVICE_SLUGS.app,
    number: '04',
    cardLabel: 'MOBILE APPS',
    name: ['تطبيقات الموبايل', 'Mobile apps'],
    menuSummary: ['تجربة موبايل حول مهمة المستخدم', 'Mobile journeys built around a task'],
    tagline: ['مهمّة واضحة.<br>بلمسة أسهل.', 'One clear task.<br>A better touch.'],
    description: [
      'تطبيق يبدأ بما يحتاج المستخدم إنجازه، ثم نحوله إلى شاشات ومسار ووظائف متّفق عليها.',
      'An app begins with what the user needs to accomplish. We turn that into considered screens, flows and a clearly agreed feature set.',
    ],
    highlights: [
      ['رحلة المستخدم والشاشات', 'User journeys & screens'],
      ['الوظائف والربط المطلوب', 'Features & integrations'],
    ],
    audience: [
      'خدمة يحتاج العميل أو الموظف استخدامها باستمرار من الموبايل.',
      'A service customers or employees need to use repeatedly on mobile.',
    ],
    deliverables: [
      ['تحديد رحلة المستخدم والوظائف', 'A defined user journey and feature set'],
      ['تصميم شاشات النسخة الأولى', 'Version-one interface design'],
      ['تطوير المنصات المتّفق عليها', 'Development for the agreed platforms'],
      ['اختبار وتجهيز التسليم والنشر', 'Testing, handover and launch preparation'],
    ],
    toAgree: [
      'المنصات، الحسابات، الصلاحيات، الإشعارات، الربط، ومتطلبات حسابات المتاجر. نحدّد ما يدخل في النسخة الأولى وما يأتي لاحقاً.',
      'Platforms, accounts, permissions, notifications, integrations and store account requirements. We define version one and later phases separately.',
    ],
  },
];
