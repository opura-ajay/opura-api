import jwt from "jsonwebtoken";
import User from "../modules/user-management/models/User.js";

/**
 * Middleware to verify JWT token and populate req.user with full user details
 * Attaches user object with combined name (firstName + lastName)
 */
export const authenticateToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database
    const user = await User.findById(decoded.id)
      .select("-password -refreshTokens")
      .populate("tenant_id", "name code status");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status}`,
      });
    }

    // Attach normalized user to req.user
    req.user = {
      id: user._id.toString(),
      name: `${user.firstName}${user.lastName ? " " + user.lastName : ""}`,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id,
      permissions: user.permissions,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }
    console.error("❌ Auth middleware error:", err);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: err.message,
    });
  }
};

/**
 * Optional middleware for endpoints that work with or without auth
 * Populates req.user if token is present, otherwise continues
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id)
      .select("-password -refreshTokens")
      .populate("tenant_id", "name code status");

    if (user && user.status === "active") {
      req.user = {
        id: user._id.toString(),
        name: `${user.firstName}${user.lastName ? " " + user.lastName : ""}`,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id,
        permissions: user.permissions,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    } else {
      req.user = null;
    }

    next();
  } catch (err) {
    // If token is invalid, just continue without user
    req.user = null;
    next();
  }
};
