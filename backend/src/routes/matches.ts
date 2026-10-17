import { Router } from "express";
import { getMatchesForItem } from "../controllers/matchController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/:id/matches", authenticate, getMatchesForItem);

export default router;