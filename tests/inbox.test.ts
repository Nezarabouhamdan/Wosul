import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { handleInbox } from '../src/worker/inbox.ts';
import { MemoryDatabase } from './helpers/memory-database.ts';

const credentials = { INBOX_USERNAME: 'wosul', INBOX_PASSWORD: 'correct horse battery staple' };

function basicAuth(username: string, password: string): string {
  const bytes = new TextEncoder().encode(`${username}:${password}`);
  return `Basic ${btoa(String.fromCharCode(...bytes))}`;
}

function inboxRequest(authorization?: string): Request {
  return new Request('https://wosul.example/inbox', { headers: authorization ? { Authorization: authorization } : {} });
}

function databaseWithInquiry(fields: Record<string, unknown> = {}): MemoryDatabase {
  const db = new MemoryDatabase();
  db.rows.push({
    id: '1f0c2a9e-0000-4000-8000-000000000000',
    submission_id: crypto.randomUUID(),
    created_at: Date.UTC(2026, 9, 25, 8, 30),
    full_name: 'Test Visitor',
    company: 'A & B',
    phone: '+12025550123',
    email: 'visitor@example.com',
    services: '["booking","crm"]',
    context: '',
    brief: 'We need a booking system.',
    timeline: 'soon',
    language: 'en',
    rate_key: 'x',
    ...fields,
  });
  return db;
}

describe('GET /inbox', () => {
  test('is unavailable until the database and credentials are configured', async () => {
    assert.equal((await handleInbox(inboxRequest(), { DB: new MemoryDatabase() })).status, 503);
    assert.equal((await handleInbox(inboxRequest(), { ...credentials })).status, 503);
  });

  test('asks for credentials and rejects wrong ones', async () => {
    const env = { DB: databaseWithInquiry(), ...credentials };
    const anonymous = await handleInbox(inboxRequest(), env);
    assert.equal(anonymous.status, 401);
    assert.match(anonymous.headers.get('www-authenticate') ?? '', /^Basic /);
    assert.ok(!(await anonymous.text()).includes('Test Visitor'));

    assert.equal((await handleInbox(inboxRequest(basicAuth('wosul', 'wrong')), env)).status, 401);
    assert.equal((await handleInbox(inboxRequest(basicAuth('admin', credentials.INBOX_PASSWORD)), env)).status, 401);
    assert.equal((await handleInbox(inboxRequest('Basic %%%'), env)).status, 401);
  });

  test('lists inquiries for the team, with private headers', async () => {
    const env = { DB: databaseWithInquiry(), ...credentials };
    const response = await handleInbox(inboxRequest(basicAuth('wosul', credentials.INBOX_PASSWORD)), env);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.ok(html.includes('Test Visitor'));
    assert.ok(html.includes('A &amp; B'));
    assert.ok(html.includes('أنظمة الحجوزات') && html.includes('إدارة العملاء CRM'));
    assert.ok(html.includes('href="tel:+12025550123"'));
    assert.ok(html.includes('href="https://wa.me/12025550123"'));
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.match(response.headers.get('content-security-policy') ?? '', /default-src 'none'/);
    assert.match(response.headers.get('x-robots-tag') ?? '', /noindex/);
  });

  test('escapes everything visitors typed', async () => {
    const db = databaseWithInquiry({
      full_name: '<img src=x onerror=alert(1)>',
      brief: '<script>alert(1)</script>',
      context: '"><b>',
    });
    const response = await handleInbox(inboxRequest(basicAuth('wosul', credentials.INBOX_PASSWORD)), {
      DB: db,
      ...credentials,
    });
    const html = await response.text();
    assert.ok(html.includes('&lt;img src=x'));
    assert.ok(html.includes('&lt;script&gt;'));
    assert.ok(!html.includes('<script>'));
    assert.ok(!html.includes('"><b>'));
  });

  test('supports non-ASCII passwords', async () => {
    const env = { DB: new MemoryDatabase(), INBOX_USERNAME: 'وصول', INBOX_PASSWORD: 'كلمة-سر-طويلة' };
    const response = await handleInbox(inboxRequest(basicAuth('وصول', 'كلمة-سر-طويلة')), env);
    assert.equal(response.status, 200);
    assert.ok((await response.text()).includes('بانتظار أول رسالة'));
  });
});
