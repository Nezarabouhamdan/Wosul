import assert from 'node:assert/strict';
import { beforeEach, describe, test } from 'node:test';
import { createSubmissionId } from '../src/shared/inquiry.ts';
import { createFormSession } from '../src/worker/form-session.ts';
import { handleInquiry } from '../src/worker/inquiries.ts';
import { readJson, validInquiry } from './helpers/fixtures.ts';
import { MemoryDatabase } from './helpers/memory-database.ts';

const ORIGIN = 'https://wosul.example';
const token = crypto.randomUUID();

function inquiryRequest(body: unknown = validInquiry(), headers: Record<string, string> = {}): Request {
  return new Request(`${ORIGIN}/api/inquiries`, {
    method: 'POST',
    headers: {
      Origin: ORIGIN,
      'Content-Type': 'application/json',
      Cookie: `__Host-wosul-form=${token}`,
      'X-Wosul-Form-Token': token,
      'CF-Connecting-IP': '203.0.113.7',
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('POST /api/inquiries', () => {
  let db: MemoryDatabase;
  beforeEach(() => {
    db = new MemoryDatabase();
  });

  test('stores a valid inquiry and returns a receipt', async () => {
    const response = await handleInquiry(inquiryRequest(), db);
    assert.equal(response.status, 201);
    const { id } = await readJson(response);
    assert.match(id ?? '', /^[0-9a-f-]{36}$/);
    assert.equal(db.rows.length, 1);
    assert.equal(db.rows[0].phone, '+12025550123');
    assert.equal(db.rows[0].services, '["booking"]');
    assert.notEqual(db.rows[0].rate_key, '203.0.113.7', 'raw IP addresses are never stored');
    assert.equal(response.headers.get('cache-control'), 'no-store');
  });

  test('returns the same receipt for a retry instead of storing a duplicate', async () => {
    const inquiry = validInquiry();
    const first = await readJson(await handleInquiry(inquiryRequest(inquiry), db));
    const retry = await handleInquiry(inquiryRequest(inquiry), db);
    assert.equal(retry.status, 200);
    assert.equal((await readJson(retry)).id, first.id);
    assert.equal(db.rows.length, 1);
  });

  test('rejects requests from another origin', async () => {
    assert.equal((await handleInquiry(inquiryRequest(undefined, { Origin: 'https://evil.example' }), db)).status, 403);
  });

  test('rejects a missing or mismatched form token', async () => {
    assert.equal((await handleInquiry(inquiryRequest(undefined, { 'X-Wosul-Form-Token': 'invalid' }), db)).status, 403);
    assert.equal((await handleInquiry(inquiryRequest(undefined, { Cookie: '' }), db)).status, 403);
  });

  test('requires JSON', async () => {
    assert.equal((await handleInquiry(inquiryRequest(undefined, { 'Content-Type': 'text/plain' }), db)).status, 415);
  });

  test('rejects malformed bodies', async () => {
    assert.equal((await handleInquiry(inquiryRequest('{not json'), db)).status, 400);
    assert.equal((await handleInquiry(inquiryRequest([]), db)).status, 400);
  });

  test('rejects oversized bodies, declared or streamed', async () => {
    const declared = inquiryRequest(undefined, { 'Content-Length': '20000' });
    assert.equal((await handleInquiry(declared, db)).status, 413);
    const streamed = inquiryRequest({ ...validInquiry(), brief: 'x'.repeat(17_000) });
    assert.equal((await handleInquiry(streamed, db)).status, 413);
  });

  test('returns field errors for invalid input', async () => {
    const response = await handleInquiry(inquiryRequest({ ...validInquiry(), phone: 'bad' }), db);
    assert.equal(response.status, 422);
    const { errors = {} } = await readJson(response);
    assert.ok('phone' in errors);
  });

  test('rejects submissions that fill the honeypot field', async () => {
    assert.equal((await handleInquiry(inquiryRequest({ ...validInquiry(), website: 'spam' }), db)).status, 400);
    assert.equal(db.rows.length, 0);
  });

  test('never reports success when storage is unavailable', async () => {
    assert.equal((await handleInquiry(inquiryRequest(), undefined)).status, 503);
    db.failInserts = true;
    assert.equal((await handleInquiry(inquiryRequest(), db)).status, 503);
    assert.equal(db.rows.length, 0);
  });

  test('limits each visitor to six inquiries per 20 minutes', async () => {
    for (let i = 0; i < 6; i++) {
      assert.equal((await handleInquiry(inquiryRequest(), db)).status, 201);
    }
    assert.equal((await handleInquiry(inquiryRequest(), db)).status, 429);
    const otherVisitor = inquiryRequest(undefined, { 'CF-Connecting-IP': '198.51.100.1' });
    assert.equal((await handleInquiry(otherVisitor, db)).status, 201);
  });
});

describe('GET /api/form-session', () => {
  test('issues a secure, HttpOnly __Host- cookie over HTTPS', async () => {
    const response = createFormSession(new Request(`${ORIGIN}/api/form-session`));
    const { token: issued } = await readJson(response);
    const cookie = response.headers.get('set-cookie') ?? '';
    assert.ok(cookie.startsWith(`__Host-wosul-form=${issued};`));
    for (const flag of ['HttpOnly', 'SameSite=Strict', 'Secure', 'Path=/']) assert.ok(cookie.includes(flag), flag);
  });

  test('uses a plain cookie name for local http development', () => {
    const response = createFormSession(new Request('http://localhost:8787/api/form-session'));
    assert.ok(response.headers.get('set-cookie')?.startsWith('wosul-form-dev='));
  });

  test('refuses cross-site requests', () => {
    const request = new Request(`${ORIGIN}/api/form-session`, { headers: { 'Sec-Fetch-Site': 'cross-site' } });
    assert.equal(createFormSession(request).status, 403);
  });

  test('a fresh session token is accepted by the inquiry endpoint', async () => {
    const issued = (await readJson(createFormSession(new Request(`${ORIGIN}/api/form-session`)))).token!;
    const request = inquiryRequest(
      { ...validInquiry(), submissionId: createSubmissionId() },
      { Cookie: `__Host-wosul-form=${issued}`, 'X-Wosul-Form-Token': issued },
    );
    assert.equal((await handleInquiry(request, new MemoryDatabase())).status, 201);
  });
});
