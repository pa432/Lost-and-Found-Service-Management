import prisma from "../src/utils/prisma";
import { generateEmbedding } from "../src/services/embedding";

async function backfill() {
  const items = await prisma.$queryRawUnsafe<
    { id: string; title: string; description: string }[]
  >(
    `SELECT id, title, description FROM "Item" WHERE embedding IS NULL`
  );

  console.log(`Found ${items.length} items without embeddings`);

  for (const item of items) {
    try {
      const text = `${item.title}. ${item.description}`.trim();
      const embedding = await generateEmbedding(text);
      const vectorString = `[${embedding.join(",")}]`;

      await prisma.$executeRawUnsafe(
        `UPDATE "Item" SET embedding = $1::extensions.vector WHERE id = $2`,
        vectorString,
        item.id
      );

      console.log(`✅ ${item.title}`);
      // Small delay to avoid rate limiting on the Edge Function
      await new Promise((r) => setTimeout(r, 300));
    } catch (err: any) {
      console.error(`❌ Failed for "${item.title}":`, err.message);
    }
  }

  console.log("Done.");
  await prisma.$disconnect();
}

backfill();