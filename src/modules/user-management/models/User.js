import mongoose from "mongoose";
import { rolePermissions } from "../../../config/rolePermissions.js";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: false },

    role: {
      type: String,
      enum: ["super_admin", "merchant_admin", "finance_admin"],
      required: true,
    },

    is_super_admin: { type: Boolean, default: false },
    is_system_user: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "suspended", "deactivated", "not_verified"],
      default: "not_verified",
    },

    tenant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },

    twoFA_enabled: { type: Boolean, default: false },
    password_last_changed: { type: Date },
    last_login: { type: Date },
    failed_attempts: { type: Number, default: 0 },
    last_failed_login: { type: Date },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpiry: { type: Date },
    isDefaultPassword: { type: Boolean, default: true }, // until user changes it
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    defaultPassword: { type: String }, // TEMP FIELD: to store default password sent via email
    refreshTokens: [{ token: String, createdAt: Date, expiresAt: Date }],

    // 🧩 NEW FIELD: store role-based permissions (auto populated)
    permissions: {
      type: Map,
      of: [String],
      default: {},
    },
  },
  { timestamps: true }
);

// 🧠 Assign default permissions automatically based on role when user is created
userSchema.pre("save", function (next) {
  if (this.isNew && rolePermissions[this.role]) {
    this.permissions = rolePermissions[this.role];
  }
  next();
});

export default mongoose.model("User", userSchema);
