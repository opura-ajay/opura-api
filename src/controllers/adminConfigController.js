import { z } from "zod";
import AdminConfig from "../models/AdminConfig.js";

// Helper: extract user from request (from JWT token via auth middleware)
const extractUser = (req) => {
  // Extract from req.user populated by auth middleware (JWT token)
  if (req?.user?.id && req?.user?.email) {
    return {
      id: req.user.id,
      name: req.user.name || `${req.user.firstName || ""}${req.user.lastName ? " " + req.user.lastName : ""}`.trim(),
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

// Helper: build flattened minimal config from full AdminConfig doc
const buildMinimalConfig = (configDoc) => {
  const out = {};
  if (!configDoc?.sections) return out;
  Object.entries(configDoc.sections).forEach(([sectionKey, section]) => {
    if (!section?.fields || !Array.isArray(section.fields)) return;
    section.fields.forEach((field) => {
      if (field.key && field.current_value !== undefined) {
        out[field.key] = field.current_value;
      }
    });
  });
  return out;
};


/**
 * @desc Get all admin configurations (with pagination)
 * @route GET /api/config
 * @access Private (super_admin only)
 */
// export const getAllConfigs = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, search } = req.query;

//     const filter = {};
//     if (search) {
//       filter._id = new RegExp(search, "i");
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const configs = await AdminConfig.find(filter)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await AdminConfig.countDocuments(filter);

//     res.status(200).json({
//       success: true,
//       message: "Admin configurations retrieved successfully",
//       total,
//       page: parseInt(page),
//       limit: parseInt(limit),
//       data: configs,
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
//     const { _id, merchant_id } = req.body;
//     const configId = _id || merchant_id;

//     if (!configId) {
//       return res.status(400).json({
//         success: false,
//         message: "_id or merchant_id is required",
//       });
//     }

//     // Check if config already exists
//     const existingConfig = await AdminConfig.findById(configId);
//     if (existingConfig) {
//       return res.status(409).json({
//         success: false,
//         message: `Configuration for merchant_id ${configId} already exists`,
//       });
//     }

//     // Create new config
//     const newConfig = new AdminConfig({
//       _id: configId,
//       ...req.body,
//     });

//     await newConfig.save();

//     res.status(201).json({
//       success: true,
//       message: "Admin configuration created successfully",
//       data: newConfig,
//     });
//   } catch (err) {
//     console.error("❌ Error creating admin config:", err);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
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

    const config = await AdminConfig.findById(merchant_id);

    if (!config) {
      return res.status(404).json({
        success: false,
        message: `Configuration for merchant_id ${merchant_id} not found`,
      });
    }

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
    res.status(500).json({
      success: false,
      message: "Internal server error",
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
//     const updateData = req.body;

//     // Update audit trail
//     if (updateData.meta && updateData.meta.audit) {
//       updateData.meta.audit.last_updated_at = new Date();
//       updateData.meta.audit.change_count =
//         (updateData.meta.audit.change_count || 0) + 1;
//     }

//     const updatedConfig = await AdminConfig.findByIdAndUpdate(
//       merchant_id,
//       updateData,
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//     if (!updatedConfig) {
//       return res.status(404).json({
//         success: false,
//         message: `Configuration for merchant_id ${merchant_id} not found`,
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Admin configuration updated successfully",
//       data: updatedConfig,
//     });
//   } catch (err) {
//     console.error("❌ Error updating admin config:", err);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
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
    
    // Extract user from JWT token (set by authenticateToken middleware)
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

    const deletedConfig = await AdminConfig.findByIdAndDelete(merchant_id);

    if (!deletedConfig) {
      return res.status(404).json({
        success: false,
        message: `Configuration for merchant_id ${merchant_id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin configuration deleted successfully",
      data: { merchant_id },
      user,
    });
  } catch (err) {
    console.error("❌ Error deleting admin config:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
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

//     // Check if config already exists
//     const existingConfig = await AdminConfig.findById(merchant_id);
//     if (existingConfig) {
//       return res.status(409).json({
//         success: false,
//         message: `Configuration for merchant_id ${merchant_id} already exists. Use PATCH to update.`,
//       });
//     }

//     // Create a default structure based on a template
//     // In production, you'd want to have a template config or require full structure
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

    const config = await AdminConfig.findById(merchant_id);

    if (!config) {
      return res.status(404).json({
        success: false,
        message: `Configuration for merchant_id ${merchant_id} not found`,
      });
    }

    // Extract minimal config values dynamically from all sections
    const minimalConfig = buildMinimalConfig(config);

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
    res.status(500).json({
      success: false,
      message: "Internal server error",
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
    const updates = req.body; // e.g., { chatbot_name: "New Name", theme: "dark" }
    
    // Extract user from JWT token (set by authenticateToken middleware)
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

    const config = await AdminConfig.findById(merchant_id);

    if (!config) {
      return res.status(404).json({
        success: false,
        message: `Configuration for merchant_id ${merchant_id} not found`,
      });
    }

    // Track if any updates were made
    let updateCount = 0;

    // Iterate through all sections and update matching fields
    Object.entries(config.sections).forEach(([sectionKey, section]) => {
      if (!section?.fields || !Array.isArray(section.fields)) {
        return;
      }

      section.fields.forEach((field) => {
        // If this field key exists in the updates, update its current_value
        if (field.key && updates.hasOwnProperty(field.key)) {
          field.current_value = updates[field.key];
          updateCount++;
        }
      });
    });

    if (updateCount === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    // Update audit trail
    config.meta.audit.last_updated_at = new Date();
    config.meta.audit.change_count = (config.meta.audit.change_count || 0) + 1;
    config.meta.audit.last_updated_by = {
      user_id: user.id,
      full_name: user.name,
      email: user.email,
    };

    await config.save();

    // Build full flattened minimal config after updates
    const minimalConfig = buildMinimalConfig(config);

    res.status(200).json({
      success: true,
      message: `Updated ${updateCount} field(s) successfully`,
      updates_applied: updateCount,
      merchant_id,
      config: minimalConfig,
      user,
    });
  } catch (err) {
    console.error("❌ Error updating minimal config:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

/**
 * @desc Reset specific fields to factory values
 * @route POST /api/config/minimal/:merchant_id/reset
 * @access Private
 */
export const resetMinimalFields = async (req, res) => {
  try {
    const { merchant_id } = req.params;
    const { fields } = req.body; // e.g., { fields: ["chatbot_name", "theme"] }

    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "fields array is required (e.g., ['chatbot_name', 'theme'])",
      });
    }

    const config = await AdminConfig.findById(merchant_id);

    if (!config) {
      return res.status(404).json({
        success: false,
        message: `Configuration for merchant_id ${merchant_id} not found`,
      });
    }

    let resetCount = 0;

    // Iterate through all sections and reset matching fields
    Object.entries(config.sections).forEach(([sectionKey, section]) => {
      if (!section?.fields || !Array.isArray(section.fields)) {
        return;
      }

      section.fields.forEach((field) => {
        // If this field key is in the reset list, reset to factory_value
        if (field.key && fields.includes(field.key)) {
          field.current_value = field.factory_value;
          resetCount++;
        }
      });
    });

    if (resetCount === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to reset",
      });
    }

    // Update audit trail
    config.meta.audit.last_updated_at = new Date();
    config.meta.audit.change_count = (config.meta.audit.change_count || 0) + 1;
    config.meta.audit.last_change_summary = `Reset ${resetCount} field(s) to factory values`;

    await config.save();

    res.status(200).json({
      success: true,
      message: `Reset ${resetCount} field(s) to factory values`,
      fields_reset: resetCount,
    });
  } catch (err) {
    console.error("❌ Error resetting minimal config:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

/**
 * @desc Reset ALL fields to factory values (no request body needed)
 * @route POST /api/config/minimal/:merchant_id/reset
 * @access Private
 */
export const resetAllMinimalFields = async (req, res) => {
  try {
    const { merchant_id } = req.params;
    
    // Extract user from JWT token (set by authenticateToken middleware)
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

    const config = await AdminConfig.findById(merchant_id);

    if (!config) {
      return res.status(404).json({
        success: false,
        message: `Configuration for merchant_id ${merchant_id} not found`,
      });
    }

    let resetCount = 0;

    // Helper function to compare values (handles primitives, arrays, objects)
    const valuesAreDifferent = (current, factory) => {
      // Handle null/undefined cases
      if (current === factory) return false;
      if (current == null || factory == null) return true;

      // Check type mismatch
      const currentType = typeof current;
      const factoryType = typeof factory;
      if (currentType !== factoryType) return true;

      // Handle arrays
      if (Array.isArray(current) && Array.isArray(factory)) {
        if (current.length !== factory.length) return true;
        return current.some((val, idx) => valuesAreDifferent(val, factory[idx]));
      }

      // Handle objects
      if (currentType === 'object' && !Array.isArray(current)) {
        const currentKeys = Object.keys(current);
        const factoryKeys = Object.keys(factory);
        if (currentKeys.length !== factoryKeys.length) return true;
        return currentKeys.some(key => valuesAreDifferent(current[key], factory[key]));
      }

      // Handle primitives (string, number, boolean)
      return current !== factory;
    };

    // Iterate through all sections and reset ALL fields
    Object.entries(config.sections).forEach(([sectionKey, section]) => {
      if (!section?.fields || !Array.isArray(section.fields)) {
        return;
      }

      section.fields.forEach((field) => {
        // Reset every field's current_value to factory_value
        if (valuesAreDifferent(field?.current_value, field?.factory_value)) {
          field.current_value = field.factory_value;
          resetCount++;
        }
      });
    });

    // Update audit trail
    config.meta.audit.last_updated_at = new Date();
    config.meta.audit.change_count = (config.meta.audit.change_count || 0) + 1;
    config.meta.audit.last_change_summary = `Reset ${resetCount} field(s) to factory values (full reset)`;
    config.meta.audit.last_updated_by = {
      user_id: user.id,
      full_name: user.name,
      email: user.email,
    };

    await config.save();

    // Build and include flattened config after reset
    const minimalConfig = buildMinimalConfig(config);

    res.status(200).json({
      success: true,
      message: `Reset ${resetCount} field(s) to factory values`,
      fields_reset: resetCount,
      merchant_id,
      config: minimalConfig,
      user,
    });
  } catch (err) {
    console.error("❌ Error resetting minimal config:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

