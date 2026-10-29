import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth";
import {
  getStats,
  getAllClaims,
  getAllUsers,
  updateUserRole,
} from "../controllers/adminController";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/stats", getStats);
router.get("/claims", getAllClaims);
router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole);

export default router;