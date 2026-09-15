import { NextResponse } from 'next/server';
import { CONTROL_COOKIE, controlCookieOptions } from '../../../../lib/control-room-auth';
import { sameOrigin } from '../../../../lib/request-security';

export const runtime = 'nodejs';

export async function POST(request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Request origin was rejected.' }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(CONTROL_COOKIE, '', { ...controlCookieOptions, maxAge: 0 });
  return response;
}
