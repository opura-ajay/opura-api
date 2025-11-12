// config/rolePermissions.js
export const rolePermissions = {
  super_admin: {
    userManagement: ["read", "write", "delete"],
    finance: ["read"],
    adminPanel: ["read", "write"],
    dashboard: ["read"],
  },
  merchant_admin: {
    userManagement: ["read", "write"],
    finance: ["read"],
    adminPanel: ["read", "write"],
    dashboard: ["read"],
  },
  finance: {
    userManagement: ["read"],
    finance: ["read", "write"],
    adminPanel: ["read"],
    dashboard: ["read"],
  },
};
