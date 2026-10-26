import type { Database, Statement } from '../../src/worker/database.ts';

type Row = Record<string, unknown> & { id: string; submission_id: string; created_at: number; rate_key: string };

/** An in-memory stand-in for D1 that understands the queries in src/worker/database.ts. */
export class MemoryDatabase implements Database {
  rows: Row[] = [];
  failInserts = false;

  prepare(query: string): Statement {
    const sql = query.replace(/\s+/g, ' ').trim();
    let params: unknown[] = [];

    const statement: Statement = {
      bind: (...values) => {
        params = values;
        return statement;
      },
      first: async <T>() => {
        if (sql.startsWith('SELECT id FROM inquiries WHERE submission_id = ?')) {
          const row = this.rows.find((r) => r.submission_id === params[0]);
          return (row ? { id: row.id } : null) as T | null;
        }
        if (sql.startsWith('SELECT count(*) AS total FROM inquiries')) {
          const [rateKey, since] = params as [string, number];
          const total = this.rows.filter((r) => r.rate_key === rateKey && r.created_at > since).length;
          return { total } as T;
        }
        throw new Error(`Unexpected query: ${sql}`);
      },
      all: async <T>() => {
        if (!sql.startsWith('SELECT id, created_at')) throw new Error(`Unexpected query: ${sql}`);
        const limit = params[0] as number;
        const results = [...this.rows].sort((a, b) => b.created_at - a.created_at).slice(0, limit);
        return { results: results as T[] };
      },
      run: async () => {
        if (!sql.startsWith('INSERT INTO inquiries')) throw new Error(`Unexpected query: ${sql}`);
        if (this.failInserts) throw new Error('Storage unavailable');
        const columns = /\(([^)]+)\) VALUES/
          .exec(sql)![1]
          .split(',')
          .map((column) => column.trim());
        if (columns.length !== params.length) throw new Error('Column/parameter count mismatch');
        const row = Object.fromEntries(columns.map((column, i) => [column, params[i]])) as Row;
        if (this.rows.some((r) => r.submission_id === row.submission_id)) {
          throw new Error('UNIQUE constraint failed: inquiries.submission_id');
        }
        this.rows.push(row);
        return { success: true };
      },
    };
    return statement;
  }
}
