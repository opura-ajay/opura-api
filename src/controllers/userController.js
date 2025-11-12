import bcrypt from "bcryptjs";
import { z } from "zod";
import User from "../models/User.js";
import { rolePermissions } from "../config/rolePermissions.js";

// 🧾 Validation schema
const createUserSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["super_admin", "merchant_admin", "finance"]),
  tenant_id: z.string().optional(),
  is_super_admin: z.boolean().optional(),
  is_system_user: z.boolean().optional(),
});

export const createUser = async (req, res) => {
  try {
    // ✅ 1. Validate request body
    const parsedData = createUserSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsedData.error.flatten(),
      });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      role,
      tenant_id,
      is_super_admin,
      is_system_user,
    } = parsedData.data;

    // ✅ 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // ✅ 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ 4. Prepare user object
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      tenant_id: tenant_id || null,
      is_super_admin: is_super_admin || role === "super_admin",
      is_system_user: is_system_user || false,
    });

    // 🧠 Auto-assign permissions handled in schema pre-save hook
    // but you can also force-set here explicitly if desired:
    // newUser.permissions = rolePermissions[role];

    // ✅ 5. Save user
    const savedUser = await newUser.save();

    // ✅ 6. Send response (hide password)
    const { password: _, ...userData } = savedUser.toObject();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: userData,
    });
  } catch (err) {
    console.error("❌ Error creating user:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    // ✅ Query Params
    const {
      role, // filter by role
      status, // filter by user status
      tenant_id, // filter by tenant
      search, // search by name or email
      page = 1, // pagination
      limit = 10, // pagination
    } = req.query;

    // ✅ Build dynamic filter
    const filter = {};

    if (role) filter.role = role;
    if (status) filter.status = status;
    if (tenant_id) filter.tenant_id = tenant_id;

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
      ];
    }

    // ✅ Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // ✅ Fetch users (exclude password & tokens)
    const users = await User.find(filter)
      .select("-password -refreshTokens")
      .populate("tenant_id", "name code status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // ✅ Count total users for pagination
    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      users,
    });
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};
