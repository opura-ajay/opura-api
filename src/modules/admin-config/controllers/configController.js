import { z } from "zod";
import * as configService from "../services/configService.js";

// Helper: extract user from request (from JWT token via auth middleware)
const extractUser = (req) => {
  if (req?.user?.id && req?.user?.email) {
    return {
      id: req.user.id,
      name:
        req.user.name ||
        `${req.user.firstName || ""}${req.user.lastName ? " " + req.user.lastName : ""}`.trim(),
      email: req.user.email,
    };
  }
  return null;
};

// Zod schema to validate incoming user for non-GET endpoints
const userSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
});

/**
 * @desc Get all admin configurations (with pagination)
 * @route GET /api/config
 * @access Private (super_admin only)
 */
// export const getAllConfigs = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, search } = req.query;

//     const result = await configService.getAllConfigs({ page, limit, search });

//     res.status(200).json({
//       success: true,
//       message: "Admin configurations retrieved successfully",
//       total: result.total,
//       page: result.page,
//       limit: result.limit,
//       data: result.configs,
//     });
//   } catch (err) {
//     console.error("❌ Error fetching admin configs:", err);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: err.message,
//     });
//   }
// };

/**
 * @desc Create a new admin configuration
 * @route POST /api/config
 * @access Private (super_admin only)
 */
// export const createConfig = async (req, res) => {
//   try {
//     const newConfig = await configService.createConfig(req.body);

//     res.status(201).json({
//       success: true,
//       message: "Admin configuration created successfully",
//       data: newConfig,
//     });
//   } catch (err) {
//     console.error("❌ Error creating admin config:", err);
//     const status = err.status || 500;
//     res.status(status).json({
//       success: false,
//       message: err.message || "Internal server error",
//       error: err.message,
//     });
//   }
// };

/**
 * @desc Get full admin configuration by merchant_id
 * @route GET /api/config/:merchant_id
 * @access Private
 */
export const getFullConfig = async (req, res) => {
  try {
    const { merchant_id } = req.params;

    const config = await configService.getFullConfig(merchant_id);

    // Extract user from auth context (if authenticated)
    const user = extractUser(req);

    res.status(200).json({
      success: true,
      message: "Admin configuration retrieved successfully",
      data: config,
      user,
    });
  } catch (err) {
    console.error("❌ Error fetching admin config:", err);
    const status = err.status || 500;
    res.status(status).json({
      success: false,
      message: err.message || "Internal server error",
      error: err.message,
    });
  }
};

/**
 * @desc Update admin configuration by merchant_id
 * @route PUT /api/config/:merchant_id
 * @access Private
 */
// export const updateFullConfig = async (req, res) => {
//   try {
//     const { merchant_id } = req.params;

//     const updatedConfig = await configService.updateFullConfig(
//       merchant_id,
//       req.body
//     );

//     res.status(200).json({
//       success: true,
//       message: "Admin configuration updated successfully",
//       data: updatedConfig,
//     });
//   } catch (err) {
//     console.error("❌ Error updating admin config:", err);
//     const status = err.status || 500;
//     res.status(status).json({
//       success: false,
//       message: err.message || "Internal server error",
//       error: err.message,
//     });
//   }
// };

/**
 * @desc Delete admin configuration by merchant_id
 * @route DELETE /api/config/:merchant_id
 * @access Private (super_admin only)
 */
export const deleteConfig = async (req, res) => {
  try {
    const { merchant_id } = req.params;

    // Extract user from JWT token
    const user = extractUser(req);

    // Validate user presence (should always be present due to authenticateToken middleware)
    const parsed = userSchema.safeParse(user);
    if (!parsed.success) {
      return res.status(401).json({
        success: false,
        message: "Authentication required - user details not found in token",
        errors: parsed.error.flatten(),
      });
    }

    await configService.deleteConfig(merchant_id);

    res.status(200).json({
      success: true,
      message: "Admin configuration deleted successfully",
      data: { merchant_id },
      user,
    });
  } catch (err) {
    console.error("❌ Error deleting admin config:", err);
    const status = err.status || 500;
    res.status(status).json({
      success: false,
      message: err.message || "Internal server error",
      error: err.message,
    });
  }
};

/**
 * @desc Create minimal configuration (from flat key-value pairs)
 * @route POST /api/config/minimal
 * @access Private (super_admin only)
 */
// export const createMinimalConfig = async (req, res) => {
//   try {
//     const { merchant_id, config } = req.body;

//     if (!merchant_id) {
//       return res.status(400).json({
//         success: false,
//         message: "merchant_id is required",
//       });
//     }

//     if (!config || typeof config !== "object") {
//       return res.status(400).json({
//         success: false,
//         message: "config object is required",
//       });
//     }

//     // Creating from minimal structure not supported
//     return res.status(400).json({
//       success: false,
//       message:
//         "Creating from minimal structure not supported. Use POST /api/config with full structure or seed the config first.",
//     });
//   } catch (err) {
//     console.error("❌ Error creating minimal config:", err);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: err.message,
//     });
//   }
// };

/**
 * @desc Get minimal configuration for chatbot initialization
 * @route GET /api/config/minimal/:merchant_id
 * @access Public
 */
export const getMinimalConfig = async (req, res) => {
  try {
    const { merchant_id } = req.params;

    const minimalConfig = await configService.getMinimalConfig(merchant_id);

    // Extract user from auth context (if authenticated)
    const user = extractUser(req);

    res.status(200).json({
      success: true,
      merchant_id,
      config: minimalConfig,
      user,
    });
  } catch (err) {
    console.error("❌ Error fetching minimal config:", err);
    const status = err.status || 500;
    res.status(status).json({
      success: false,
      message: err.message || "Internal server error",
      error: err.message,
    });
  }
};

/**
 * @desc Update minimal configuration (flat key-value updates)
 * @route PATCH /api/config/minimal/:merchant_id
 * @access Private
 */
export const updateMinimalConfig = async (req, res) => {
  try {
    const { merchant_id } = req.params;
    const updates = req.body;

    // Extract user from JWT token (set by authenticateToken middleware)
    const user = extractUser(req);

    // Validate user presence
    const parsed = userSchema.safeParse(user);
    if (!parsed.success) {
      return res.status(401).json({
        success: false,
        message: "Authentication required - user details not found in token",
        errors: parsed.error.flatten(),
      });
    }

    const result = await configService.updateMinimalConfig(
      merchant_id,
      updates,
      user
    );

    res.status(200).json({
      success: true,
      message: `Updated ${result.updateCount} field(s) successfully`,
      updates_applied: result.updateCount,
      merchant_id,
      config: result.minimalConfig,
      user,
    });
  } catch (err) {
    console.error("❌ Error updating minimal config:", err);
    const status = err.status || 500;
    res.status(status).json({
      success: false,
      message: err.message || "Internal server error",
      error: err.message,
    });
  }
};

/**
 * @desc Reset specific fields to factory values
 * @route POST /api/config/minimal/:merchant_id/reset_selected
 * @access Private
 */
// export const resetMinimalFields = async (req, res) => {
//   try {
//     const { merchant_id } = req.params;
//     const { fields } = req.body;

//     const result = await configService.resetMinimalFields(merchant_id, fields);

//     res.status(200).json({
//       success: true,
//       message: `Reset ${result.resetCount} field(s) to factory values`,
//       fields_reset: result.resetCount,
//     });
//   } catch (err) {
//     console.error("❌ Error resetting minimal config:", err);
//     const status = err.status || 500;
//     res.status(status).json({
//       success: false,
//       message: err.message || "Internal server error",
//       error: err.message,
//     });
//   }
// };

/**
 * @desc Reset ALL fields to factory values (no request body needed)
 * @route POST /api/config/minimal/:merchant_id/reset
 * @access Private
 */
export const resetAllMinimalFields = async (req, res) => {
  try {
    const { merchant_id } = req.params;

    // Extract user from JWT token
    const user = extractUser(req);

    // Validate user presence
    const parsed = userSchema.safeParse(user);
    if (!parsed.success) {
      return res.status(401).json({
        success: false,
        message: "Authentication required - user details not found in token",
        errors: parsed.error.flatten(),
      });
    }

    const result = await configService.resetAllMinimalFields(merchant_id, user);

    res.status(200).json({
      success: true,
      message: `Reset ${result.resetCount} field(s) to factory values`,
      fields_reset: result.resetCount,
      merchant_id,
      config: result.minimalConfig,
      user,
    });
  } catch (err) {
    console.error("❌ Error resetting minimal config:", err);
    const status = err.status || 500;
    res.status(status).json({
      success: false,
      message: err.message || "Internal server error",
      error: err.message,
    });
  }
};
