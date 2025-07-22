import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const USERNAME = process.env.BASIC_AUTH_USER;
const PASSWORD = process.env.BASIC_AUTH_PASS;

export function middleware(request: NextRequest) {
  const basicAuth = request.headers.get('authorization');
  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pass] = atob(authValue).split(':');
    if (user === USERNAME && pass === PASSWORD) {
      return NextResponse.next();
    }
  }
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 