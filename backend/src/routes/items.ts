import { Router } from "express";
import {
    createItem,
    getItems,
    getItemById,
    getUserItems,
    deleteItem,
} from "../controllers/itemController";
import { authenticate } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

// Public routes
router.get("/", getItems);
router.get("/:id", getItemById);

// Protected routes
router.post("/", authenticate, upload.single("image"), createItem);
router.get("/user/mine", authenticate, getUserItems);
router.delete("/:id", authenticate, deleteItem);

export default router;