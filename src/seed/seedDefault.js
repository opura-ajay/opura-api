import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../modules/user-management/models/User.js";
import connectDB from "../db.js";

dotenv.config();

const run = async () => {
  try {
    await connectDB();

    // ---- SUPER ADMIN ----
    const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@system.com";
    const adminPwd = process.env.SEED_ADMIN_PASSWORD || "Admin@123";

    if (!(await User.findOne({ email: adminEmail }))) {
      const hash = await bcrypt.hash(adminPwd, 10);
      await User.create({
        firstName: "System",
        lastName: "Admin",
        email: adminEmail,
        password: hash,
        role: "super_admin",
        is_super_admin: true,
        is_system_user: true,
        status: "active",
      });
      console.log("🌱 Seeded Super Admin:", adminEmail);
    }

    // ---- TENANT for Merchant ----
    // const tenantCode = process.env.SEED_MERCHANT_TENANT_CODE || "TENANT001";
    // let tenant = await Tenant.findOne({ code: tenantCode });
    // if (!tenant) {
    //   tenant = await Tenant.create({
    //     name: process.env.SEED_MERCHANT_TENANT_NAME || "Demo Merchant",
    //     code: tenantCode,
    //     status: "active",
    //   });
    //   console.log("🏢 Created Tenant:", tenantCode);
    // }

    // ---- MERCHANT ADMIN ----
    // const merchantEmail =
    //   process.env.SEED_MERCHANT_EMAIL || "merchant.admin@system.com";
    // const merchantPwd = process.env.SEED_MERCHANT_PASSWORD || "Merchant@123";

    // if (!(await User.findOne({ email: merchantEmail }))) {
    //   const hash = await bcrypt.hash(merchantPwd, 10);
    //   await User.create({
    //     firstName: "Merchant",
    //     lastName: "Admin",
    //     email: merchantEmail,
    //     password: hash,
    //     role: "merchant_admin",
    //     tenant_id: tenant._id,
    //     is_super_admin: false,
    //     is_system_user: true,
    //   });
    //   console.log("🌱 Seeded Merchant Admin:", merchantEmail);
    // }

    // ---- FINANCE USER (System Seeded Only) ----
    const financeEmail = process.env.SEED_FINANCE_EMAIL || "finance@system.com";
    const financePwd = process.env.SEED_FINANCE_PASSWORD || "Finance@123";

    if (!(await User.findOne({ email: financeEmail }))) {
      const hash = await bcrypt.hash(financePwd, 10);
      await User.create({
        firstName: "Finance",
        lastName: "User",
        email: financeEmail,
        password: hash,
        role: "finance_admin",
        status: "active",
        is_super_admin: false,
        is_system_user: true,
      });
      console.log("🌱 Seeded Finance User:", financeEmail);
    }

    console.log("✅ Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed Error:", err);
    process.exit(1);
  }
};

run();
