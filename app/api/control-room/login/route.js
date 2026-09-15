import { NextResponse } from 'next/server';
import { CONTROL_COOKIE, controlCookieOptions, createControlSession, passwordMatches } from '../../../../lib/control-room-auth';
import { requestFingerprint, sameOrigin } from '../../../../lib/request-security';
import { supabaseRequest } from '../../../../lib/supabase-admin';

export const runtime = 'nodejs';

export async function POST(request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Request origin was rejected.' }, { status: 403 });
  try {
    const fingerprint = requestFingerprint(request);
    const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const attempts = await supabaseRequest(`/rest/v1/wall_activity?select=successful&fingerprint=eq.${fingerprint}&action=eq.login&created_at=gte.${encodeURIComponent(since)}`);
    if (attempts.length >= 8) return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });

    const { password } = await request.json();
    const successful = passwordMatches(password);
    await supabaseRequest('/rest/v1/wall_activity', { method: 'POST', headers: { prefer: 'return=minimal' }, json: { fingerprint, action: 'login', successful } });
    if (!successful) return NextResponse.json({ error: 'That key is not correct.' }, { status: 401 });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(CONTROL_COOKIE, createControlSession(), controlCookieOptions);
    return response;
  } catch (error) {
    console.error('Control room login failed:', error);
    return NextResponse.json({ error: 'The control room is not configured yet.' }, { status: 503 });
  }
}
