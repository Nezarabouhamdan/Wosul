/**
 * Inline SVG icons used by the page templates and the lab demos.
 * Line icons use a 24px grid with 1.45px strokes; arrows use 1.8px strokes.
 */
import type { ServiceId } from './catalog.ts';

export const arrowIcon =
  '<svg class="ui-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';

export const downArrowIcon =
  '<svg class="ui-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 4v16m-6-6 6 6 6-6"/></svg>';

export const backArrowIcon =
  '<svg class="ui-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20 12H4m6-6-6 6 6 6"/></svg>';

export const chevronIcon =
  '<svg class="ui-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

export const checkIcon =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 4 4L19 6"/></svg>';

/** The arrow icon wrapped for buttons and text links, where it nudges on hover. */
export const arrow = `<span class="arrow" aria-hidden="true">${arrowIcon}</span>`;

const servicePaths: Record<ServiceId, string> = {
  booking: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h3m3 0h2m-8 3h3"/>',
  crm: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 3v18M13 8h4m-4 4h4m-4 4h2"/>',
  web: '<rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 9h20m-16-3h.1M9 6h.1m-2 7h5m-5 3h9"/>',
  app: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 5h4m-4 14h4m-5-8 2 2 4-4"/>',
};

export function serviceIcon(id: ServiceId): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${servicePaths[id]}</svg>`;
}
