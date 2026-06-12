// POST /api/inquiry - Submit a new inquiry
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;

  try {
    const body = await context.request.json() as {
      name?: string;
      email?: string;
      buyer_type?: string;
      product?: string;
      quantity?: string;
      market?: string;
      message?: string;
      source?: string;
    };

    if (!body.name || !body.email) {
      return new Response(JSON.stringify({ error: 'Name and email are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await DB.prepare(
      `INSERT INTO inquiries (name, email, buyer_type, product, quantity, market, message, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      body.name,
      body.email,
      body.buyer_type || null,
      body.product || null,
      body.quantity || null,
      body.market || null,
      body.message || null,
      body.source || 'website'
    ).run();

    const id = result.meta.last_row_id;

    // Send email notification if Resend API key is configured
    if (context.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'SaiWei Sport <noreply@saiweisport.com>',
            to: ['sales@saiweisport.com'],
            subject: `[New Inquiry] ${body.product || 'General'} - ${body.buyer_type || 'Buyer'} from ${body.market || 'Unknown'}`,
            text: `New inquiry received from SaiWei Sport website:\n\nName: ${body.name}\nEmail: ${body.email}\nBuyer Type: ${body.buyer_type || 'N/A'}\nProduct: ${body.product || 'N/A'}\nQuantity: ${body.quantity || 'N/A'}\nMarket: ${body.market || 'N/A'}\n\nMessage:\n${body.message || 'No message'}\n\n---\nView in dashboard: https://saiweisport.com/admin`,
          }),
        });
      } catch {
        // Email sending failed, but inquiry was saved
      }
    }

    return new Response(JSON.stringify({ success: true, id }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
