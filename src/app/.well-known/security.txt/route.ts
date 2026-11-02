import { NextResponse } from 'next/server';

/**
 * GET /.well-known/security.txt
 *
 * Serves the security contact file per RFC 9116.
 * Using a Route Handler instead of a static public/ file because Next.js on
 * Vercel does not reliably serve dot-prefixed directories (e.g. .well-known)
 * from the public/ folder — they may resolve to 404.
 *
 * The content here must stay in sync with public/.well-known/security.txt.
 */
export async function GET() {
  const body = [
    '# Security contact information for Toy Hourse',
    '# This file follows RFC 9116 (https://www.rfc-editor.org/rfc/rfc9116)',
    '',
    'Contact: mailto:info.rimondutta@gmail.com',
    '',
    '# This file expires 11 months from the security hardening date (2026-11-02).',
    '# Renew it before this date to avoid automated scanners flagging it as stale.',
    'Expires: 2027-10-02T00:00:00Z',
    '',
    'Preferred-Languages: en',
    '',
    'Canonical: https://toyhourse.vercel.app/.well-known/security.txt',
    '',
  ].join('\n');

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // Cache for 1 hour at the edge; clients may cache for 24 hours.
      // Keep TTL short so contact changes propagate quickly.
      'Cache-Control': 'public, max-age=86400, s-maxage=3600',
    },
  });
}

