import { NextResponse } from 'next/server';
import { requestFingerprint, sameOrigin } from '../../../../../../lib/request-security';
import { supabaseRequest } from '../../../../../../lib/supabase-admin';

export const runtime = 'nodejs';

const reactions = new Set(['love', 'cool', 'smart', 'would_use']);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request, context) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Request origin was rejected.' }, { status: 403 });

  try {
    const { id } = await context.params;
    const body = await request.json();
    if (!uuid.test(id) || !reactions.has(body.reaction)) {
      return NextResponse.json({ error: 'Choose a valid reaction.' }, { status: 400 });
    }

    const result = await supabaseRequest('/rest/v1/rpc/set_community_project_reaction', {
      method: 'POST',
      json: {
        p_project_id: id,
        p_fingerprint: requestFingerprint(request),
        p_reaction: body.reaction,
      },
    });

    return NextResponse.json(result, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    console.error('Wall reaction failed:', error);
    return NextResponse.json({ error: 'Your reaction could not be saved. Please try again.' }, { status: 503 });
  }
}
