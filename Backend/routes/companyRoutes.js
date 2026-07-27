import express from "express";
import { getCompany, createOrUpdateCompany } from "../controllers/companyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getCompany);
router.post("/", createOrUpdateCompany);

export default router;