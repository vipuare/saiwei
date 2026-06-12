// GET /api/inquiry/:id - Get inquiry detail
// PATCH /api/inquiry/:id - Update inquiry status or add followup
// Types (Env, Inquiry, Followup) are declared in functions/env.d.ts

function checkAuth(request: Request, env: Env): boolean {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') || request.headers.get('X-Admin-Token');
  return !!token && token === env.ADMIN_TOKEN;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  if (!checkAuth(context.request, context.env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { DB } = context.env;
  const id = context.params.id as string;

  const inquiry = await DB.prepare('SELECT * FROM inquiries WHERE id = ?').bind(id).first<Inquiry>();
  if (!inquiry) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { results: followups } = await DB.prepare(
    'SELECT * FROM inquiry_followups WHERE inquiry_id = ? ORDER BY created_at ASC'
  ).bind(id).all();

  return new Response(JSON.stringify({ inquiry, followups }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  if (!checkAuth(context.request, context.env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { DB } = context.env;
  const id = context.params.id as string;

  try {
    const body = await context.request.json() as {
      status?: string;
      note?: string;
      replied_by?: string;
    };

    if (body.status) {
      await DB.prepare('UPDATE inquiries SET status = ? WHERE id = ?').bind(body.status, id).run();
    }

    if (body.note) {
      await DB.prepare(
        'INSERT INTO inquiry_followups (inquiry_id, note, replied_by) VALUES (?, ?, ?)'
      ).bind(id, body.note, body.replied_by || 'admin').run();
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
    },
  });
};
