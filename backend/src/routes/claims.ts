import { Router } from "express";
import {
  createClaim,
  getItemClaims,
  getMyClaims,
  updateClaimStatus,
} from "../controllers/claimController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/items/:itemId/claims", authenticate, createClaim);
router.get("/items/:itemId/claims", authenticate, getItemClaims);
router.get("/claims/mine", authenticate, getMyClaims);
router.patch("/claims/:claimId", authenticate, updateClaimStatus);

export default router;