// middleware/checkPermission.js

import rolePermissions from "../config/rolePermissions";

export const checkPermission = (module, action) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user?.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const perms = rolePermissions[user.role];
    if (!perms) {
      return res.status(403).json({ message: "Unknown role" });
    }

    const allowed = perms[module]?.includes(action);
    if (allowed) return next();

    return res.status(403).json({
      message: `Access denied: ${action.toUpperCase()} on ${module}`,
    });
  };
};
