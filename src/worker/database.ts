/**
 * All SQL lives here. The schema is in migrations/0001_create_inquiries.sql.
 */
import type { Inquiry } from '../shared/inquiry.ts';

/** The part of Cloudflare's D1 API the site uses (tests pass an in-memory fake). */
export interface Database {
  prepare(query: string): Statement;
}

export interface Statement {
  bind(...values: unknown[]): Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}

export interface NewInquiry extends Inquiry {
  id: string;
  createdAt: number;
  /** Hashed client identifier used for rate limiting (never a raw IP). */
  rateKey: string;
}

/** A stored inquiry as shown in the inbox. `services` is a JSON array. */
export interface InquiryRow {
  id: string;
  created_at: number;
  full_name: string;
  company: string;
  phone: string;
  email: string;
  services: string;
  context: string;
  brief: string;
  timeline: string;
  language: string;
}

export async function findInquiryId(db: Database, submissionId: string): Promise<string | null> {
  const row = await db
    .prepare('SELECT id FROM inquiries WHERE submission_id = ?')
    .bind(submissionId)
    .first<{ id: string }>();
  return row?.id ?? null;
}

export async function countInquiriesSince(db: Database, rateKey: string, since: number): Promise<number> {
  const row = await db
    .prepare('SELECT count(*) AS total FROM inquiries WHERE rate_key = ? AND created_at > ?')
    .bind(rateKey, since)
    .first<{ total: number }>();
  return row?.total ?? 0;
}

export async function insertInquiry(db: Database, inquiry: NewInquiry): Promise<void> {
  await db
    .prepare(
      `INSERT INTO inquiries
        (id, submission_id, created_at, full_name, company, phone, email, services, context, brief, timeline, language, rate_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      inquiry.id,
      inquiry.submissionId,
      inquiry.createdAt,
      inquiry.fullName,
      inquiry.company,
      inquiry.phone,
      inquiry.email,
      JSON.stringify(inquiry.services),
      inquiry.context,
      inquiry.brief,
      inquiry.timeline,
      inquiry.language,
      inquiry.rateKey,
    )
    .run();
}

export async function listLatestInquiries(db: Database, limit: number): Promise<InquiryRow[]> {
  const { results } = await db
    .prepare(
      `SELECT id, created_at, full_name, company, phone, email, services, context, brief, timeline, language
       FROM inquiries ORDER BY created_at DESC LIMIT ?`,
    )
    .bind(limit)
    .all<InquiryRow>();
  return results;
}
