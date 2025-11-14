import dotenv from "dotenv";
import connectDB from "../../../db.js";
import AdminConfig from "../models/Config.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const adminConfigData = JSON.parse(
  readFileSync(join(__dirname, "./config.json"), "utf-8")
);

dotenv.config();

const seedAdminConfig = async () => {
  try {
    await connectDB();

    const merchantId = adminConfigData._id || "merchant_12345";

    // Check if config already exists
    const existingConfig = await AdminConfig.findById(merchantId);
    if (existingConfig) {
      console.log(`⚙️  Admin config for ${merchantId} already exists. Skipping.`);
      process.exit(0);
    }

    // Create new admin config from JSON file
    await AdminConfig.create(adminConfigData);

    console.log(`✅ Admin config seeded successfully for merchant: ${merchantId}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding admin config:", err);
    process.exit(1);
  }
};

seedAdminConfig();
