/** POST /api/inquiries: validates and stores a contact form submission. */
import { validateInquiry } from '../shared/inquiry.ts';
import { countInquiriesSince, findInquiryId, insertInquiry } from './database.ts';
import type { Database } from './database.ts';
import { FORM_TOKEN_HEADER, formCookieName } from './form-session.ts';
import { getCookie, json, sha256, toHex } from './http.ts';

const MAX_BODY_BYTES = 16_000;
/** At most this many inquiries per visitor within the window. */
const RATE_LIMIT = { max: 6, windowMs: 20 * 60_000 };
const DAY_MS = 86_400_000;
const TOO_LARGE = Symbol('too large');

export async function handleInquiry(request: Request, db: Database | undefined): Promise<Response> {
  const url = new URL(request.url);
  if (request.headers.get('origin') !== url.origin) return json({ error: 'origin' }, 403);

  const sessionToken = getCookie(request, formCookieName(url));
  if (!sessionToken || sessionToken !== request.headers.get(FORM_TOKEN_HEADER)) {
    return json({ error: 'session' }, 403);
  }
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json({ error: 'content_type' }, 415);
  }

  const body = await readJsonBody(request);
  if (body === TOO_LARGE) return json({ error: 'size' }, 413);
  if (!isRecord(body)) return json({ error: 'body' }, 400);
  // "website" is a hidden honeypot field that only bots fill in.
  if (body.website) return json({ error: 'body' }, 400);

  const { valid, data, errors } = validateInquiry(body);
  if (!valid) return json({ errors }, 422);
  if (!db) return json({ error: 'unavailable' }, 503);

  try {
    // A retry of the same letter returns the original receipt instead of a duplicate.
    const existingId = await findInquiryId(db, data.submissionId);
    if (existingId) return json({ id: existingId });

    const now = Date.now();
    const rateKey = await rateLimitKey(request, sessionToken, now);
    if ((await countInquiriesSince(db, rateKey, now - RATE_LIMIT.windowMs)) >= RATE_LIMIT.max) {
      return json({ error: 'rate_limit' }, 429);
    }

    const id = crypto.randomUUID();
    await insertInquiry(db, { ...data, id, createdAt: now, rateKey });
    return json({ id }, 201);
  } catch {
    // A retry racing the original request trips the unique index; it still gets the receipt.
    const existingId = await findInquiryId(db, data.submissionId).catch(() => null);
    return existingId ? json({ id: existingId }) : json({ error: 'unavailable' }, 503);
  }
}

/** Reads at most MAX_BODY_BYTES of strict UTF-8 JSON. Returns undefined when unreadable. */
async function readJsonBody(request: Request): Promise<unknown> {
  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) return TOO_LARGE;
  if (!request.body) return undefined;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return TOO_LARGE;
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return JSON.parse(new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(bytes));
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Identifies a visitor for rate limiting without storing their IP address:
 * a hash of the IP (or form session) that changes every day.
 */
async function rateLimitKey(request: Request, sessionToken: string, now: number): Promise<string> {
  const ip = request.headers.get('cf-connecting-ip');
  const client = ip ? `ip:${ip}` : `session:${sessionToken}`;
  return toHex(await sha256(`${client}|${Math.floor(now / DAY_MS)}`));
}
