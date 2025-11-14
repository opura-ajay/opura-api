import express from "express";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Merge all routes for this module
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

export default router;
