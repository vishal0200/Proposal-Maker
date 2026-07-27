import express from "express";
import { getTemplates, createTemplate } from "../controllers/templateController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getTemplates);
router.post("/", createTemplate);

export default router;