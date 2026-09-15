import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const CONTROL_COOKIE = 'pindari_control_room';
const SESSION_SECONDS = 60 * 60 * 8;

function secret() {
  const value = process.env.CONTROL_ROOM_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('CONTROL_ROOM_SESSION_SECRET must contain at least 32 characters.');
  return value;
}

function sign(value) {
  return createHmac('sha256', secret()).update(value).digest('base64url');
}

export function createControlSession() {
  const payload = Buffer.from(JSON.stringify({ expires: Date.now() + SESSION_SECONDS * 1000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function hasValidControlSession(request) {
  const token = request.cookies.get(CONTROL_COOKIE)?.value;
  if (!token) return false;
  const [payload, suppliedSignature] = token.split('.');
  if (!payload || !suppliedSignature) return false;
  const expectedSignature = sign(payload);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return false;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString()).expires > Date.now();
  } catch {
    return false;
  }
}

export function passwordMatches(candidate) {
  const password = process.env.CONTROL_ROOM_PASSWORD;
  if (!password || password.length < 12) throw new Error('CONTROL_ROOM_PASSWORD must contain at least 12 characters.');
  const supplied = Buffer.from(String(candidate || ''));
  const expected = Buffer.from(password);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export const controlCookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_SECONDS,
  priority: 'high',
};
