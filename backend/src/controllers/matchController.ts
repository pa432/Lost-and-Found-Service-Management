import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { findMatches } from "../services/matching";

export async function getMatchesForItem(req: AuthRequest, res: Response) {
  try {
    const itemId = String(req.params.id);
    const threshold = req.query.threshold
      ? parseFloat(String(req.query.threshold))
      : 0.5;
    const limit = req.query.limit ? parseInt(String(req.query.limit)) : 5;

    const matches = await findMatches(itemId, threshold, limit);

    return res.json({ matches, count: matches.length });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ error: err.message || "Failed to find matches" });
  }
}