import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * @desc Login user
 * @route POST /api/users/login
 * @access Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    if (user.status !== "active")
      return res.status(403).json({ message: `Account is ${user.status}` });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    user.last_login = new Date();
    await user.save();

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Validate input
    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and password are required" });
    }

    // Decode token (⚠️ decode does NOT verify signature)
    const decodedToken = jwt.decode(token);
    if (!decodedToken || !decodedToken.email) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Find user by email
    const user = await User.findOne({ email: decodedToken.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🚫 Prevent re-verification or token reuse
    if (user.isVerified && !user.verificationToken) {
      return res.status(400).json({
        message: "User already verified or token already used",
      });
    }

    // 🚫 Optional: check if token matches the one stored in DB
    if (user.verificationToken && user.verificationToken !== token) {
      return res.status(400).json({ message: "Invalid verification token" });
    }

    // ✅ Check token expiry
    if (
      user.verificationTokenExpiry &&
      user.verificationTokenExpiry < Date.now()
    ) {
      return res.status(400).json({ message: "Verification token expired" });
    }

    // 🔐 Hash new password and update verification status
    user.password = await bcrypt.hash(password, 10);
    user.isVerified = true;
    user.isDefaultPassword = false;
    user.status = "active"; // Activate user
    user.verificationToken = null; // Make token one-time use
    user.verificationTokenExpiry = null;

    await user.save();

    res.status(200).json({
      message: "✅ User verified successfully",
      email: user.email,
    });
  } catch (err) {
    console.error("Verify User Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
