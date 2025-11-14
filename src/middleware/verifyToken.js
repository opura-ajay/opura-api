// middleware/verifyToken.js
import jwt from "jsonwebtoken";
import User from "../modules/user-management/models/User.js";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authorization header missing or malformed" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Get user from DB (ensures token belongs to active user)
    const user = await User.findById(decoded.id).select(
      "-password -refreshTokens"
    );
    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    return res.status(401).json({ message: "Unauthorized or invalid token" });
  }
};
