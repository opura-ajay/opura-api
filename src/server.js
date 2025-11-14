import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./db.js";
import { swaggerUi, swaggerSpec } from "./config/swaggerConfig.js";
import { configRoutes } from "./modules/admin-config/index.js";

// Import models to register them with Mongoose
import "./modules/user-management/models/tenant.js";
import "./modules/user-management/models/User.js";

// Import module route indexes
import userManagementModule from "./modules/user-management/index.js";

dotenv.config();

const app = express();

// 🔗 Connect Database
connectDB();

// ⚙️ Middleware
app.use(cors());
app.use(express.json());

// 📘 Swagger Setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs-json", (req, res) => res.json(swaggerSpec));

//Admin Config Route
app.use("/api/bot-config", configRoutes);

// 🧩 Register Modules
app.use("/api", userManagementModule); // User Management Module

// 🌐 Root route
app.get("/", (req, res) => {
  res.send("🚀 Node.js modular server running successfully!");
});

// 🚀 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
