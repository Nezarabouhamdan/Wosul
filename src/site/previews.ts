/**
 * Static, illustrative product mock-ups (fictional sample data) used on the
 * home page project cards and the service page heroes.
 */
import type { ServiceId } from '../shared/catalog.ts';
import { arrowIcon, serviceIcon } from '../shared/icons.ts';
import { html } from './html.ts';

const windowBar = (title: string, label: string) =>
  `<div class="window-bar"><span class="dots">● ● ●</span><b>${title}</b><span>${label}</span></div>`;

function crmPreview(): string {
  const stages = [
    ['New inquiry', 'Property inquiry', 'Needs review'],
    ['In conversation', 'Family home', 'Follow up today'],
    ['Meeting booked', 'Investment brief', 'Next: consultation'],
  ];
  return html`
    <div class="preview-crm" dir="ltr">
      ${windowBar('WOSUL / FLOW', 'CRM CONCEPT')}
      <div class="crm-shell">
        <aside><img src="/images/wosul-icon.svg" width="25" height="25" alt=""><i></i><i></i><i></i></aside>
        <div class="crm-content">
          <div class="crm-title">
            <div><small>THE NEXT STEP, IN VIEW</small><strong>Sales workspace</strong></div>
            <span class="avatar-mini">W</span>
          </div>
          <div class="preview-columns">
            ${stages.map(
              ([stage, title, note], i) => html`
                <div>
                  <h4><i class="stage-dot d${i}"></i>${stage}</h4>
                  <article>
                    <span class="tiny-tag">SAMPLE 0${i + 1}</span>
                    <b>${title}</b>
                    <small>${note}</small>
                    <div class="fake-line"></div>
                    <div class="fake-line short"></div>
                    <span class="owner-tag">Wosul demo</span>
                  </article>
                </div>
              `,
            )}
          </div>
          <div class="crm-summary"><i></i> Clear ownership. A visible next step.</div>
        </div>
      </div>
    </div>
  `;
}

function bookingPreview(): string {
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  return html`
    <div class="preview-booking" dir="ltr">
      ${windowBar('WOSUL / SLOT', 'BOOKING CONCEPT')}
      <div class="booking-paper">
        <small>MAKE ROOM FOR WHAT’S NEXT</small>
        <h4>Your next appointment.</h4>
        <div class="calendar-mini">
          ${days.map((day, i) => `<span${i === 2 ? ' class="selected"' : ''}>${day}<b>${12 + i}</b></span>`)}
        </div>
        <div class="slots-mini">
          <span>10:00</span><span class="selected">11:30 <i>✓</i></span><span>13:00</span>
        </div>
        <div class="booking-confirm">A clear time. A confirmed next step. <b>${arrowIcon}</b></div>
      </div>
    </div>
  `;
}

function appPreview(): string {
  return html`
    <div class="preview-mobile" dir="ltr">
      <span class="orbit orbit-a"></span>
      <span class="orbit orbit-b"></span>
      <div class="mobile-device">
        <div class="notch"></div>
        <div class="mobile-screen">
          <small>WOSUL / SERVICE</small>
          <h4>What can we<br>make easier?</h4>
          <div class="mobile-tile">
            ${serviceIcon('booking')}
            <div><b>Book a service</b><small>Choose a time that works</small></div>
            <i>${arrowIcon}</i>
          </div>
          <div class="mobile-tile muted">
            ${serviceIcon('crm')}
            <div><b>Your requests</b><small>Follow the next step</small></div>
          </div>
          <div class="mobile-nav">${serviceIcon('web')}${serviceIcon('booking')}${serviceIcon('crm')}</div>
        </div>
      </div>
      <span class="mobile-caption mono">A TASK. A TOUCH. A BETTER FLOW.</span>
    </div>
  `;
}

function webPreview(): string {
  return html`
    <div class="preview-web" dir="ltr">
      ${windowBar('WOSUL / PRESENCE', 'WEBSITE CONCEPT')}
      <div class="website-canvas">
        <nav><b>FORM.</b><span>Studio &nbsp; Services &nbsp; Contact</span></nav>
        <h4>A clearer<br>point of view.</h4>
        <p>Considered spaces. A considered experience.</p>
        <div class="web-sculpture"></div>
        <span class="web-cta">Explore the studio ${arrowIcon}</span>
      </div>
    </div>
  `;
}

export const previews: Record<ServiceId, () => string> = {
  crm: crmPreview,
  booking: bookingPreview,
  app: appPreview,
  web: webPreview,
};
