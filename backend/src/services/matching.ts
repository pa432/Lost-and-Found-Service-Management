import prisma from "../utils/prisma";
import { generateEmbedding } from "./embedding";

export interface MatchResult {
    id: string;
    title: string;
    description: string;
    status: string;
    category: string | null;
    location: string | null;
    imageUrl: string | null;
    date: Date;
    similarity: number;
    user: { id: string; name: string; email: string };
}

/**
 * Generate and store an embedding for an item.
 */
export async function storeItemEmbedding(
    itemId: string,
    title: string,
    description: string
): Promise<void> {
    const text = `${title}. ${description}`.trim();
    const embedding = await generateEmbedding(text);

    // pgvector expects a string like "[0.1,0.2,0.3,...]"
    const vectorString = `[${embedding.join(",")}]`;

    await prisma.$executeRawUnsafe(
        `UPDATE "Item" SET embedding = $1::extensions.vector WHERE id = $2`,
        vectorString,
        itemId
    );

    console.log(`✅ Embedding stored for item ${itemId}`);
}

/**
 * Find opposite-status items that are semantically similar to the given item.
 */
export async function findMatches(
    itemId: string,
    threshold: number = 0.3,
    limit: number = 5
): Promise<MatchResult[]> {
    // Fetch the source item's status and embedding
    const sourceRows = await prisma.$queryRawUnsafe<
        { status: string; embedding: string | null }[]
    >(`SELECT status::text, embedding::text FROM "Item" WHERE id = $1`, itemId);

    if (!sourceRows.length || !sourceRows[0].embedding) {
        return [];
    }

    const sourceStatus = sourceRows[0].status;
    const oppositeStatus = sourceStatus === "LOST" ? "FOUND" : "LOST";

    const matches = await prisma.$queryRawUnsafe<MatchResult[]>(
        `
    SELECT
      i.id,
      i.title,
      i.description,
      i.status::text AS status,
      i.category,
      i.location,
      i."imageUrl",
      i.date,
      1 - (i.embedding <=> (SELECT embedding FROM "Item" WHERE id = $1)) AS similarity,
      json_build_object(
        'id', u.id,
        'name', u.name,
        'email', u.email
      ) AS user
    FROM "Item" i
    JOIN "User" u ON u.id = i."userId"
    WHERE i.id != $1
      AND i.status::text = $2
      AND i.embedding IS NOT NULL
      AND 1 - (i.embedding <=> (SELECT embedding FROM "Item" WHERE id = $1)) >= $3
    ORDER BY i.embedding <=> (SELECT embedding FROM "Item" WHERE id = $1)
    LIMIT $4
    `,
        itemId,
        oppositeStatus,
        threshold,
        limit
    );

    return matches;
}