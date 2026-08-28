import { NextRequest, NextResponse } from 'next/server';
import {
  GOOGLE_PLACES_REQUEST_HEADER,
  GOOGLE_PLACES_SESSION_COOKIE,
  shouldGrantGooglePlacesRequest,
} from '@/lib/google-places-policy';

/**
 * The cookie is a session-scoped, HttpOnly request budget marker. The first
 * eligible Preview request gets the internal header that permits one server
 * Google request; every later request in that browser session is denied.
 */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(GOOGLE_PLACES_REQUEST_HEADER);

  if (!shouldGrantGooglePlacesRequest({
    environment: process.env,
    externalAreaRequested: request.nextUrl.searchParams.has('externalArea'),
    sessionRequestAlreadyUsed: request.cookies.get(GOOGLE_PLACES_SESSION_COOKIE)?.value === '1',
  })) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  requestHeaders.set(GOOGLE_PLACES_REQUEST_HEADER, '1');
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.cookies.set({
    name: GOOGLE_PLACES_SESSION_COOKIE,
    value: '1',
    httpOnly: true,
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
    path: '/decision-functional-preview-v3',
  });
  return response;
}

export const config = {
  matcher: ['/decision-functional-preview-v3'],
};
