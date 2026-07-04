import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  
  // Conditionally allow 'unsafe-eval' in development because React Fast Refresh requires it.
  // In production, it remains strictly secure.
  const isDev = process.env.NODE_ENV === 'development';
  const scriptSrc = isDev 
    ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' https: http:;"
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: http:;`;

  const cspHeader = `
    default-src 'self';
    ${scriptSrc}
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://www.kapruka.com https://cdn.kapruka.com https://kapruka.com;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
    connect-src 'self' https://openrouter.ai https://mcp.kapruka.com;
  `.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);
  requestHeaders.set('X-Content-Type-Options', 'nosniff');

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Content-Type-Options', 'nosniff');

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
