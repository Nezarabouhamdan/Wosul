/**
 * Cloudflare Worker entry point. Static pages and files are served directly
 * from dist/ by Cloudflare; only the paths listed under `run_worker_first`
 * in wrangler.jsonc reach this code.
 */
import { createFormSession } from './form-session.ts';
import { methodNotAllowed, json } from './http.ts';
import { handleInbox } from './inbox.ts';
import { handleInquiry } from './inquiries.ts';

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  INBOX_USERNAME?: string;
  INBOX_PASSWORD?: string;
}

export default {
  async fetch(request, env): Promise<Response> {
    const { pathname } = new URL(request.url);
    const method = request.method;

    switch (pathname) {
      case '/api/form-session':
        return method === 'GET' ? createFormSession(request) : methodNotAllowed('GET');
      case '/api/inquiries':
        return method === 'POST' ? handleInquiry(request, env.DB) : methodNotAllowed('POST');
      case '/inbox':
      case '/inbox/':
        return method === 'GET' ? handleInbox(request, env) : methodNotAllowed('GET');
    }

    if (pathname.startsWith('/api/')) return json({ error: 'not_found' }, 404);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
