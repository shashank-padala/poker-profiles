import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const USER = process.env.BASIC_AUTH_USER!;
const PASS = process.env.BASIC_AUTH_PASS!;

export function middleware(request: NextRequest) {
  const basicAuth = request.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pass] = atob(authValue).split(':');

    if (user === USER && pass === PASS) {
      return NextResponse.next();
    }
  }

  return new Response("Authentication required", {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Poker Dashboard"',
    },
  });
}
