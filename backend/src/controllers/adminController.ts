import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/auth";

export async function getStats(req: AuthRequest, res: Response) {
  try {
    const [
      totalItems,
      lostItems,
      foundItems,
      resolvedItems,
      pendingClaims,
      totalClaims,
      totalUsers,
      withEmbeddingResult,
    ] = await Promise.all([
      prisma.item.count(),
      prisma.item.count({ where: { status: "LOST" } }),
      prisma.item.count({ where: { status: "FOUND" } }),
      prisma.item.count({ where: { status: "RESOLVED" } }),
      prisma.claim.count({ where: { status: "PENDING" } }),
      prisma.claim.count(),
      prisma.user.count(),
      prisma.$queryRawUnsafe<{ count: bigint }[]>(
        `SELECT COUNT(*)::bigint AS count FROM "Item" WHERE embedding IS NOT NULL`
      ),
    ]);

    const totalMatches = Number(withEmbeddingResult[0]?.count ?? 0);

    return res.json({
      stats: {
        totalItems,
        lostItems,
        foundItems,
        resolvedItems,
        pendingClaims,
        totalClaims,
        totalUsers,
        totalMatches,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
}

export async function getAllClaims(req: AuthRequest, res: Response) {
  try {
    const claims = await prisma.claim.findMany({
      include: {
        item: { select: { id: true, title: true, status: true } },
        claimant: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return res.json({ claims });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch claims" });
  }
}

export async function getAllUsers(req: AuthRequest, res: Response) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: { select: { items: true, claims: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
}

export async function updateUserRole(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["USER", "ADMIN"].includes(role)) {
      return res.status(400).json({ error: "Role must be USER or ADMIN" });
    }

    // Prevent admins from demoting themselves
    if (String(id) === req.user!.userId && role === "USER") {
      return res.status(400).json({ error: "You cannot demote yourself" });
    }

    const user = await prisma.user.update({
      where: { id: String(id) },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });

    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update user role" });
  }
}