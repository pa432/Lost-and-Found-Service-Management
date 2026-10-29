import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/auth";
import { emitToUser } from "../utils/socket";

export async function createClaim(req: AuthRequest, res: Response) {
  try {
    const { itemId } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length < 10) {
      return res
        .status(400)
        .json({ error: "Please provide a detailed message (at least 10 characters)" });
    }

    const item = await prisma.item.findUnique({ where: { id: String(itemId) } });
    if (!item) return res.status(404).json({ error: "Item not found" });

    if (item.status !== "FOUND") {
      return res
        .status(400)
        .json({ error: "You can only claim items marked as FOUND" });
    }

    if (item.userId === req.user!.userId) {
      return res
        .status(400)
        .json({ error: "You cannot claim your own item" });
    }

    const existing = await prisma.claim.findFirst({
      where: {
        itemId: String(itemId),
        claimantId: req.user!.userId,
        status: { in: ["PENDING", "APPROVED"] },
      },
    });

    if (existing) {
      return res
        .status(409)
        .json({ error: "You already have an active claim on this item" });
    }

    const claim = await prisma.claim.create({
      data: {
        itemId: String(itemId),
        claimantId: req.user!.userId,
        message: message.trim(),
      },
      include: {
        item: { select: { title: true, status: true } },
        claimant: { select: { name: true, email: true } },
      },
    });

    // 🔔 Notify the item owner in real time
    emitToUser(item.userId, "new_claim", {
      claimId: claim.id,
      itemId: item.id,
      itemTitle: item.title,
      claimantName: claim.claimant.name,
      message: `New claim on "${item.title}" from ${claim.claimant.name}`,
    });

    return res.status(201).json({ claim });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to create claim" });
  }
}

export async function getItemClaims(req: AuthRequest, res: Response) {
  try {
    const { itemId } = req.params;

    const item = await prisma.item.findUnique({ where: { id: String(itemId) } });
    if (!item) return res.status(404).json({ error: "Item not found" });

    // Only the item owner or an admin can see claims on an item
    if (item.userId !== req.user!.userId && req.user!.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const claims = await prisma.claim.findMany({
      where: { itemId: String(itemId) },
      include: { claimant: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ claims });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch claims" });
  }
}

export async function getMyClaims(req: AuthRequest, res: Response) {
  try {
    const claims = await prisma.claim.findMany({
      where: { claimantId: req.user!.userId },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            status: true,
            imageUrl: true,
            userId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ claims });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch your claims" });
  }
}

export async function updateClaimStatus(req: AuthRequest, res: Response) {
  try {
    const { claimId } = req.params;
    const { status } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Status must be APPROVED or REJECTED" });
    }

    const claim = await prisma.claim.findUnique({
      where: { id: String(claimId) },
      include: { item: true },
    });

    if (!claim) return res.status(404).json({ error: "Claim not found" });

    // Only the item owner or an admin can approve/reject
    if (claim.item.userId !== req.user!.userId && req.user!.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const c = await tx.claim.update({
        where: { id: String(claimId) },
        data: { status },
        include: { claimant: { select: { name: true, email: true } } },
      });

      // When a claim is approved, mark the item as RESOLVED and reject all other pending claims
      if (status === "APPROVED") {
        await tx.item.update({
          where: { id: claim.itemId },
          data: { status: "RESOLVED", resolvedAt: new Date() },
        });
        await tx.claim.updateMany({
          where: {
            itemId: claim.itemId,
            id: { not: claim.id },
            status: "PENDING",
          },
          data: { status: "REJECTED" },
        });
      }

      return c;
    });

    // 🔔 Notify the claimant in real time
    emitToUser(claim.claimantId, "claim_status_changed", {
      claimId: claim.id,
      itemId: claim.item.id,
      itemTitle: claim.item.title,
      status,
      message: `Your claim on "${claim.item.title}" was ${status.toLowerCase()}`,
    });

    return res.json({ claim: updated });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update claim" });
  }
}