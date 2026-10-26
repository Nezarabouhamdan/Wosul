import type { Bilingual, ServiceId } from '../../shared/catalog.ts';

/** Concept projects shown in the home page "lab" grid. */
export const projects: {
  id: ServiceId;
  index: string;
  type: string;
  title: Bilingual;
  summary: Bilingual;
  wide?: boolean;
}[] = [
  {
    id: 'crm',
    index: '01',
    type: 'CRM / CONCEPT',
    title: ['مسار', 'Flow'],
    summary: ['من أول استفسار، إلى متابعة واضحة.', 'From first inquiry to a clear next step.'],
    wide: true,
  },
  {
    id: 'booking',
    index: '02',
    type: 'BOOKING / CONCEPT',
    title: ['موعد', 'Slot'],
    summary: ['رحلة حجز يفهمها العميل والفريق.', 'A booking journey for customers and teams.'],
  },
  {
    id: 'app',
    index: '03',
    type: 'MOBILE / CONCEPT',
    title: ['خدمة', 'Service'],
    summary: ['مهمّة يومية، بتجربة موبايل أوضح.', 'An everyday task, made clearer on mobile.'],
  },
];

export const methodSteps: { title: Bilingual; text: Bilingual }[] = [
  {
    title: ['نفهم', 'Understand'],
    text: [
      'نسمع كيف يعمل نشاطك، من يستخدم النظام، وما الذي تريد تحسينه.',
      'We learn how your business works, who uses the system and what you want to improve.',
    ],
  },
  {
    title: ['نصمّم', 'Design'],
    text: [
      'نرتّب رحلة المستخدم والشاشات ونحدّد وظائف النسخة الأولى قبل التنفيذ.',
      'We map the user journey, screens and version-one features before development.',
    ],
  },
  {
    title: ['نبني ونختبر', 'Build & test'],
    text: [
      'نطوّر على مراحل، ونراجع السيناريوهات المتّفق عليها معك.',
      'We build in phases and review the agreed scenarios together.',
    ],
  },
  {
    title: ['نسلّم ونطلق', 'Hand over & launch'],
    text: [
      'نشرح الاستخدام، ونجهّز الإطلاق، ونحدّد الدعم والتطوير اللاحق حسب الاتفاق.',
      'We explain usage, prepare the launch and define support and later development as agreed.',
    ],
  },
];

/** `photo` is a square cut-out (transparent background) in public/images/. */
export const team: { photo: string; name: Bilingual; role: Bilingual; bio: Bilingual }[] = [
  {
    photo: '/images/team-khaled.webp',
    name: ['خالد', 'Khaled'],
    role: ['احتياجات الأعمال، التسويق وCRM', 'Business needs, marketing & CRM'],
    bio: [
      'يربط طريقة عمل النشاط بمسار العميل والوظائف المطلوبة.',
      'Connects the business workflow with the customer journey and required features.',
    ],
  },
  {
    photo: '/images/team-nizar.webp',
    name: ['نزار', 'Nizar'],
    role: ['تطوير المواقع وأنظمة الويب', 'Websites & web systems'],
    bio: [
      'يحوّل الشاشات والمسارات إلى موقع أو نظام ويب قابل للاستخدام.',
      'Turns interfaces and workflows into a usable website or web system.',
    ],
  },
  {
    photo: '/images/team-ammar.webp',
    name: ['عمار', 'Ammar'],
    role: ['تطوير تطبيقات الموبايل', 'Mobile app development'],
    bio: [
      'يبني تجربة الموبايل حول ما يحتاج المستخدم إنجازه.',
      'Builds the mobile experience around what the user needs to do.',
    ],
  },
];

/** "A way to start" scope cards. `service` is preselected in the contact form. */
export const startingPoints: {
  title: Bilingual;
  summary: Bilingual;
  scope: Bilingual;
  service: ServiceId;
  featured?: boolean;
}[] = [
  {
    title: ['حضور واضح', 'A clear presence'],
    summary: [
      'موقع يشرح خدماتك ويقود الزائر للتواصل.',
      'A website that explains your services and guides visitors to contact.',
    ],
    scope: ['هيكل وتصميم متجاوب ومسار تواصل متّفق عليه.', 'Agreed structure, responsive design and a contact journey.'],
    service: 'web',
  },
  {
    title: ['تشغيل أوضح', 'A clearer workflow'],
    summary: ['نظام حجوزات أو CRM حول عملية محدّدة.', 'A booking system or CRM around a defined process.'],
    scope: [
      'مستخدمون وصلاحيات وخطوات متابعة ضمن نطاق واضح.',
      'Users, permissions and follow-up steps within a clear scope.',
    ],
    service: 'crm',
    featured: true,
  },
  {
    title: ['منتج مخصّص', 'A custom product'],
    summary: ['تطبيق أو نظام خاص يبدأ بوظائف أساسية.', 'An app or custom system starting with essential features.'],
    scope: [
      'نسخة أولى محدّدة، وتوسّع لاحق بحسب الأولويات.',
      'A defined first release, with later phases based on priorities.',
    ],
    service: 'app',
  },
];

export const faqs: { question: Bilingual; answer: Bilingual }[] = [
  {
    question: ['من أين نبدأ إذا كانت الفكرة غير مكتملة؟', 'Where do we start if the idea is still rough?'],
    answer: [
      'نبدأ بالعملية التي تريد تسهيلها، ومن سيستخدم النظام، وأهم وظيفة في النسخة الأولى. ثم نحولها إلى نطاق واضح.',
      'We start with the process you want to improve, who will use the system and the priority for version one, then turn that into a clear scope.',
    ],
  },
  {
    question: ['هل يمكن تخصيص CRM موجود؟', 'Can you customise an existing CRM?'],
    answer: [
      'نعم، قد يكون تخصيص منصة قائمة هو الأنسب. نقارن ذلك بالتطوير الخاص بحسب الوظائف والربط والاشتراكات المطلوبة.',
      'Yes. Configuring an existing platform may be the right choice. We compare that with custom development based on features, integrations and subscriptions.',
    ],
  },
  {
    question: ['كيف يتحدّد السعر ووقت التسليم؟', 'How do you define price and delivery time?'],
    answer: [
      'بحسب الوظائف، اللغات، المنصات، المحتوى والربط. تُحدّد التكلفة والمراحل والتسليمات في العرض قبل التنفيذ.',
      'Based on features, languages, platforms, content and integrations. Cost, milestones and deliverables are set out in the proposal before development.',
    ],
  },
  {
    question: ['هل أحتاج تطبيقاً أم يكفي موقع أو نظام ويب؟', 'Do I need a mobile app, a website or a web system?'],
    answer: [
      'نقيّم المهمة وطريقة استخدام العميل أو الفريق. ثم نختار الشكل الذي يخدمها، مع توضيح متطلبات كل خيار.',
      'We look at the task and how customers or staff use the service, then choose a format that supports it and explain the requirements.',
    ],
  },
  {
    question: ['ماذا يشمل التسليم والدعم؟', 'What do handover and support include?'],
    answer: [
      'نوضّح التسليمات، الحسابات، ملكية المصدر حيث تنطبق، الاستضافة، اشتراكات الأطراف الخارجية، والدعم والتعديلات حسب الاتفاق.',
      'We clarify deliverables, accounts, source ownership where applicable, hosting, third-party subscriptions, support and changes in the agreement.',
    ],
  },
];
