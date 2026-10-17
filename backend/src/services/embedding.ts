const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error("SUPABASE_URL or SUPABASE_SERVICE_KEY missing in .env");
  }

  const url = `${SUPABASE_URL}/functions/v1/embed`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_KEY,
    },
    body: JSON.stringify({ input: text }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Supabase embed error ${response.status}: ${err}`);
  }

  const data = (await response.json()) as { embedding: number[] };

  if (!Array.isArray(data.embedding) || data.embedding.length !== 384) {
    throw new Error(
      `Unexpected embedding shape: ${JSON.stringify(data).slice(0, 100)}`
    );
  }

  return data.embedding;
}