/**
 * CSRF protection for the contact form ("double submit" pattern): the browser
 * gets a random token in the response body and the same token in an HttpOnly
 * cookie. A submission is accepted only when both match.
 */
import { json } from './http.ts';

export const FORM_TOKEN_HEADER = 'X-Wosul-Form-Token';
const SESSION_MAX_AGE_SECONDS = 30 * 60;

/** `__Host-` cookies require HTTPS, so local http development uses another name. */
export function formCookieName(url: URL): string {
  return url.protocol === 'https:' ? '__Host-wosul-form' : 'wosul-form-dev';
}

export function createFormSession(request: Request): Response {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return json({ error: 'origin' }, 403);

  const url = new URL(request.url);
  const token = crypto.randomUUID();
  const cookie = [
    `${formCookieName(url)}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
    ...(url.protocol === 'https:' ? ['Secure'] : []),
  ].join('; ');
  return json({ token }, 200, { 'Set-Cookie': cookie });
}
