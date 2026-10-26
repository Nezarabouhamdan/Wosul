/** Copy is always written Arabic first, then English. */
export type Bilingual = readonly [ar: string, en: string];
export type Language = 'ar' | 'en';

export const SERVICE_IDS = ['booking', 'crm', 'web', 'app'] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

export function isServiceId(value: unknown): value is ServiceId {
  return SERVICE_IDS.includes(value as ServiceId);
}

/** Each service has a page at /services/<slug>/. */
export const SERVICE_SLUGS: Record<ServiceId, string> = {
  booking: 'booking',
  crm: 'crm',
  web: 'websites',
  app: 'apps',
};

export const TIMELINES = [
  { id: 'asap', label: ['بأقرب وقت', 'As soon as possible'] },
  { id: 'soon', label: ['خلال ١–٣ أشهر', 'In 1–3 months'] },
  { id: 'later', label: ['خلال ٣–٦ أشهر', 'In 3–6 months'] },
  { id: 'flexible', label: ['الموعد مرن', 'I’m flexible'] },
] as const satisfies readonly { id: string; label: Bilingual }[];
export type TimelineId = (typeof TIMELINES)[number]['id'];

export function isTimelineId(value: unknown): value is TimelineId {
  return TIMELINES.some((timeline) => timeline.id === value);
}
