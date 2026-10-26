/**
 * GET /inbox: the latest inquiries, for the Wosul team only.
 * Protected by HTTP Basic authentication with the INBOX_USERNAME and
 * INBOX_PASSWORD secrets (see README.md).
 */
import { listLatestInquiries } from './database.ts';
import type { Database } from './database.ts';
import { sha256 } from './http.ts';
import { renderInboxPage } from './inbox-page.ts';

export interface InboxEnv {
  DB?: Database;
  INBOX_USERNAME?: string;
  INBOX_PASSWORD?: string;
}

const INBOX_LIMIT = 100;

const PRIVATE_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

const PAGE_HEADERS = {
  ...PRIVATE_HEADERS,
  'Content-Type': 'text/html; charset=utf-8',
  'Content-Security-Policy':
    "default-src 'none'; style-src 'self'; font-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
};

function plainText(message: string, status: number, headers: Record<string, string> = {}): Response {
  return new Response(message, {
    status,
    headers: { ...PRIVATE_HEADERS, 'Content-Type': 'text/plain; charset=utf-8', ...headers },
  });
}

export async function handleInbox(request: Request, env: InboxEnv): Promise<Response> {
  const { DB: db, INBOX_USERNAME: username, INBOX_PASSWORD: password } = env;
  if (!db || !username || !password) return plainText('The inbox is not configured.', 503);

  if (!(await hasValidCredentials(request, username, password))) {
    return plainText('Sign in to view the inbox.', 401, {
      'WWW-Authenticate': 'Basic realm="Wosul inbox", charset="UTF-8"',
    });
  }

  const rows = await listLatestInquiries(db, INBOX_LIMIT);
  return new Response(renderInboxPage(rows), { headers: PAGE_HEADERS });
}

/** Checks an "Authorization: Basic ..." header. Compares hashes in constant time. */
export async function hasValidCredentials(request: Request, username: string, password: string): Promise<boolean> {
  const match = /^Basic\s+(\S+)$/i.exec(request.headers.get('authorization') ?? '');
  if (!match) return false;

  let supplied: string;
  try {
    supplied = new TextDecoder().decode(Uint8Array.from(atob(match[1]), (char) => char.charCodeAt(0)));
  } catch {
    return false;
  }

  const [actual, expected] = await Promise.all([sha256(supplied), sha256(`${username}:${password}`)]);
  let difference = 0;
  for (let i = 0; i < expected.length; i++) difference |= actual[i] ^ expected[i];
  return difference === 0;
}
