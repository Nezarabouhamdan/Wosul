export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

export function methodNotAllowed(allowed: string): Response {
  return json({ error: 'method_not_allowed' }, 405, { Allow: allowed });
}

export function getCookie(request: Request, name: string): string | undefined {
  for (const pair of request.headers.get('cookie')?.split(';') ?? []) {
    const [key, ...value] = pair.trim().split('=');
    if (key === name) return value.join('=');
  }
  return undefined;
}

export async function sha256(text: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
