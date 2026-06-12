// GET /api/inquiries - List all inquiries (admin only)
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;

  const url = new URL(context.request.url);
  const status = url.searchParams.get('status');
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = 20;
  const offset = (page - 1) * limit;

  // Simple auth check via query param or header
  const token = url.searchParams.get('token') || context.request.headers.get('X-Admin-Token');
  if (!token || token !== context.env.ADMIN_TOKEN) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let countQuery = 'SELECT COUNT(*) as total FROM inquiries';
  let dataQuery = 'SELECT * FROM inquiries';
  const params: (string | number)[] = [];

  if (status) {
    countQuery += ' WHERE status = ?';
    dataQuery += ' WHERE status = ?';
    params.push(status);
  }

  dataQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

  const totalResult = await DB.prepare(countQuery).bind(...params).first<{ total: number }>();
  const { results } = await DB.prepare(dataQuery).bind(...params, limit, offset).all<Inquiry>();

  return new Response(JSON.stringify({
    inquiries: results,
    total: totalResult?.total || 0,
    page,
    totalPages: Math.ceil((totalResult?.total || 0) / limit),
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
    },
  });
};
