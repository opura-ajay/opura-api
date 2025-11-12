import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import adminConfigRoutes from "./routes/adminConfigRoutes.js";
import { connectDB } from "./db.js";
import "./models/tenant.js"; // must come before User
import "./models/User.js";
import "./models/AdminConfig.js";
import { swaggerUi, swaggerSpec } from "./config/swaggerConfig.js";

dotenv.config();
const app = express();

connectDB();
app.use(cors());
app.use(express.json());

// Swagger documentation routes
app.use("/api-docs", swaggerUi.serve);
app.get("/api-docs", swaggerUi.setup(swaggerSpec));
app.get("/api-docs-json", (req, res) => res.json(swaggerSpec));
//User Route
app.use("/api/users", userRoutes);
//Admin Config Route
app.use("/api/bot-config", adminConfigRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("🚀 Node.js server running!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
