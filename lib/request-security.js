import 'server-only';
import { createHmac } from 'node:crypto';

export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || new URL(request.url).protocol.replace(':', '');
  return origin === `${protocol}://${host}`;
}

export function requestFingerprint(request) {
  return requestFingerprintFromHeaders(request.headers);
}

export function requestFingerprintFromHeaders(headers) {
  const secret = process.env.CONTROL_ROOM_SESSION_SECRET;
  if (!secret) throw new Error('Session secret is unavailable.');
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const address = forwarded || headers.get('x-real-ip') || 'unknown';
  return createHmac('sha256', secret).update(address).digest('hex');
}
