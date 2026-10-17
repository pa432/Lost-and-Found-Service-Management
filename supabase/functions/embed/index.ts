const session = new Supabase.ai.Session('gte-small');

Deno.serve(async (req) => {
  try {
    const { input } = await req.json();

    if (!input) {
      return new Response(JSON.stringify({ error: 'Missing input' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const embedding = await session.run(input, {
      mean_pool: true,
      normalize: true,
    });

    return new Response(JSON.stringify({ embedding }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Embedding error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});