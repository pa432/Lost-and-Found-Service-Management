import { Response } from "express";
import prisma from "../utils/prisma";
import { uploadImage } from "../utils/supabase";
import { AuthRequest } from "../middleware/auth";
import { storeItemEmbedding } from "../services/matching";

export async function createItem(req: AuthRequest, res: Response) {
  try {
    const { title, description, category, status, location, latitude, longitude, date, detectedObjects } = req.body;

    if (!title || !description || !status || !date) {
      return res.status(400).json({ error: "Title, description, status, and date are required" });
    }

    if (status !== "LOST" && status !== "FOUND") {
      return res.status(400).json({ error: "Status must be LOST or FOUND" });
    }

    let objectsArray: string[] = [];
    if (detectedObjects) {
      try {
        const parsed = JSON.parse(String(detectedObjects));
        if (Array.isArray(parsed)) {
          objectsArray = parsed.map((o: any) => String(o)).filter(Boolean);
        }
      } catch {
        objectsArray = [];
      }
    }

    let imageUrl: string | null = null;

    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      imageUrl = await uploadImage(req.file.buffer, fileName, req.file.mimetype);
    }

    const item = await prisma.item.create({
      data: {
        title: String(title),
        description: String(description),
        category: category ? String(category) : null,
        status: status as "LOST" | "FOUND",
        location: location ? String(location) : null,
        latitude: latitude ? parseFloat(String(latitude)) : null,
        longitude: longitude ? parseFloat(String(longitude)) : null,
        imageUrl,
        detectedObjects: objectsArray,
        date: new Date(String(date)),
        userId: req.user!.userId,
      },
    });

    // Generate embedding in the background (fire-and-forget)
    storeItemEmbedding(item.id, item.title, item.description).catch((err) => {
      console.error("Embedding failed for item", item.id, err.message);
    });

    return res.status(201).json({ item });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to create item" });
  }
}

export async function getItems(req: AuthRequest, res: Response) {
  try {
    const status = req.query.status as string | undefined;
    const category = req.query.category as string | undefined;
    const q = req.query.q as string | undefined;
    const page = (req.query.page as string) || "1";
    const limit = (req.query.limit as string) || "20";

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.item.count({ where }),
    ]);

    return res.json({
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch items" });
  }
}

export async function getItemById(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        claims: {
          include: { claimant: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    return res.json({ item });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch item" });
  }
}

export async function getUserItems(req: AuthRequest, res: Response) {
  try {
    const items = await prisma.item.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch your items" });
  }
}

export async function deleteItem(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const item = await prisma.item.findUnique({ where: { id } });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    if (item.userId !== req.user!.userId && req.user!.role !== "ADMIN") {
      return res.status(403).json({ error: "You can only delete your own items" });
    }

    await prisma.item.delete({ where: { id } });
    return res.json({ message: "Item deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete item" });
  }
}