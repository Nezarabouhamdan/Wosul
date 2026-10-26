# Wosul website (وصول)

The bilingual (Arabic / English) marketing site for Wosul, with a contact form
that stores inquiries and a private inbox for the team.

- **Pages** are plain HTML, generated at build time from TypeScript templates. No front-end framework.
- **Hosting** is Cloudflare Workers: the pages are served as static files, and a small Worker
  handles the contact form API and the inbox.
- **Database** is Cloudflare D1 (SQLite) with one table, `inquiries`.
- **Tooling:** TypeScript, esbuild (bundles and minifies CSS/JS), Wrangler (Cloudflare CLI),
  Node's built-in test runner.

## Quick start

Requires Node.js 22.18 or newer.

```sh
npm install
cp .dev.vars.example .dev.vars    # local inbox username/password
npm run db:migrate:local          # create the local database
npm run dev                       # http://localhost:8787 (rebuilds on save)
```

`npm run check` runs the type checks, the tests and a production build.

## Project structure

```
src/
  site/             Build-time HTML generation
    content/        Copy and data: services, team, FAQ, … (edit text here)
    pages/          One file per page: home, service, lab, 404
    layout.ts       <head>, header and footer shared by every page
    contact-form.ts Contact form markup
    previews.ts     Illustrative product mock-ups
    html.ts         Template helpers (html``, t() for bilingual text, buttons)
  client/           Browser scripts (bundled into dist/static/)
    main.ts         Every page: language switch, mobile menu, header
    contact-form.ts Home page: validation, submission, receipt
    lab.ts          Lab page: the interactive demos
  shared/           Used by both the browser and the Worker
    inquiry.ts      Contact form rules (validation, phone normalisation)
    catalog.ts      Service and timeline ids
  styles/           CSS, one file per page section; site.css sets the order
  worker/           Cloudflare Worker (server)
    index.ts        Routing for /api/* and /inbox
    inquiries.ts    POST /api/inquiries
    form-session.ts GET /api/form-session (CSRF token)
    inbox.ts        GET /inbox (password protected)
    database.ts     All SQL queries
public/             Copied as-is: fonts, images, _headers (security + cache headers)
scripts/build.ts    Builds everything into dist/
migrations/         Database schema (D1 migrations)
tests/              Unit tests for validation, the API and the inbox
```

## Common changes

| To change…                    | Edit                                                                   |
| ----------------------------- | ---------------------------------------------------------------------- |
| Text on the site              | `src/site/content/*.ts`, or the page in `src/site/pages/`              |
| Styling                       | the matching file in `src/styles/` (later files in `site.css` win)     |
| Phone/tablet layout           | `src/styles/responsive.css` (everything ≤ 900px wide)                  |
| Contact form fields or limits | `src/site/contact-form.ts` and `src/shared/inquiry.ts`                 |
| Fonts or images               | `public/fonts/`, `public/images/` (use a new file name when replacing) |

All copy is written as `['Arabic', 'English']` pairs. Pages are rendered in
Arabic, and the language button swaps in the English text in the browser.

## Deploying to Cloudflare

One-time setup:

1. `npx wrangler login`
2. `npx wrangler d1 create wosul-inquiries` and paste the printed `database_id` into `wrangler.jsonc`.
3. `npm run db:migrate:remote`
4. `npx wrangler secret put INBOX_USERNAME` and `npx wrangler secret put INBOX_PASSWORD`
   (use a long, random password).

Each deploy:

```sh
# macOS / Linux
SITE_URL=https://your-domain.example npm run deploy
# Windows PowerShell
$env:SITE_URL = "https://your-domain.example"; npm run deploy
```

`SITE_URL` is used for canonical links, social previews, the sitemap and robots.txt.
Without it, the build uses the current ChatGPT-hosted address. Connect the custom
domain under **Workers & Pages → wosul-website → Settings → Domains & Routes**.

> **Before retiring the old ChatGPT-hosted site**, copy any inquiries from its `/inbox`.
> They are stored in that site's own database and are not transferred automatically.
> The table schema is unchanged, so they can be imported into D1 if needed.

## Inbox

`/inbox` lists the latest 100 inquiries. The browser asks for the username and
password set as secrets. For stronger protection, you can also put `/inbox`
behind [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/applications/).

## How the contact form works

1. When the visitor starts typing, the browser requests `/api/form-session`. It gets a random
   token, and the same token in an HttpOnly cookie.
2. On submit, the browser validates the form with `src/shared/inquiry.ts`, then posts it with the
   token in a header. The Worker checks the origin and the token/cookie pair (CSRF protection),
   validates again with the same rules, and stores the inquiry in D1.
3. Each letter has a `submissionId`, so a retried request returns the original receipt instead of
   creating a duplicate. A visitor can send at most 6 inquiries per 20 minutes. A hidden
   "website" field catches simple bots.
4. No emails or WhatsApp messages are sent. Inquiries only appear in `/inbox`.
