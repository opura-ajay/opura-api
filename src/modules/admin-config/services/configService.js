import AdminConfig from "../models/Config.js";

/**
 * Service layer for admin configuration business logic
 */

/**
 * Build flattened minimal config from full AdminConfig document
 * @param {Object} configDoc - Full AdminConfig document
 * @returns {Object} Flattened key-value config
 */
export const buildMinimalConfig = (configDoc) => {
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
 * Compare values (handles primitives, arrays, objects)
 * @param {*} current - Current value
 * @param {*} factory - Factory value
 * @returns {boolean} True if values are different
 */
export const valuesAreDifferent = (current, factory) => {
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
  if (currentType === "object" && !Array.isArray(current)) {
    const currentKeys = Object.keys(current);
    const factoryKeys = Object.keys(factory);
    if (currentKeys.length !== factoryKeys.length) return true;
    return currentKeys.some((key) =>
      valuesAreDifferent(current[key], factory[key])
    );
  }

  // Handle primitives (string, number, boolean)
  return current !== factory;
};

/**
 * Get all configurations with pagination
 * @param {Object} params - Query parameters { page, limit, search }
 * @returns {Promise<Object>} Paginated configs
 */
export const getAllConfigs = async ({ page = 1, limit = 10, search }) => {
  const filter = {};
  if (search) {
    filter._id = new RegExp(search, "i");
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const configs = await AdminConfig.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await AdminConfig.countDocuments(filter);

  return {
    configs,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
  };
};

/**
 * Create a new configuration
 * @param {Object} data - Config data with _id or merchant_id
 * @returns {Promise<Object>} Created config
 */
export const createConfig = async (data) => {
  const { _id, merchant_id } = data;
  const configId = _id || merchant_id;

  if (!configId) {
    throw new Error("_id or merchant_id is required");
  }

  // Check if config already exists
  const existingConfig = await AdminConfig.findById(configId);
  if (existingConfig) {
    const error = new Error(
      `Configuration for merchant_id ${configId} already exists`
    );
    error.status = 409;
    throw error;
  }

  // Create new config
  const newConfig = new AdminConfig({
    _id: configId,
    ...data,
  });

  return await newConfig.save();
};

/**
 * Get full configuration by merchant_id
 * @param {string} merchant_id - Merchant ID
 * @returns {Promise<Object>} Full config document
 */
export const getFullConfig = async (merchant_id) => {
  const config = await AdminConfig.findById(merchant_id);

  if (!config) {
    const error = new Error(
      `Configuration for merchant_id ${merchant_id} not found`
    );
    error.status = 404;
    throw error;
  }

  return config;
};

/**
 * Update full configuration
 * @param {string} merchant_id - Merchant ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated config
 */
export const updateFullConfig = async (merchant_id, updateData) => {
  // Update audit trail
  if (updateData.meta && updateData.meta.audit) {
    updateData.meta.audit.last_updated_at = new Date();
    updateData.meta.audit.change_count =
      (updateData.meta.audit.change_count || 0) + 1;
  }

  const updatedConfig = await AdminConfig.findByIdAndUpdate(
    merchant_id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedConfig) {
    const error = new Error(
      `Configuration for merchant_id ${merchant_id} not found`
    );
    error.status = 404;
    throw error;
  }

  return updatedConfig;
};

/**
 * Delete configuration
 * @param {string} merchant_id - Merchant ID
 * @returns {Promise<Object>} Deleted config
 */
export const deleteConfig = async (merchant_id) => {
  const deletedConfig = await AdminConfig.findByIdAndDelete(merchant_id);

  if (!deletedConfig) {
    const error = new Error(
      `Configuration for merchant_id ${merchant_id} not found`
    );
    error.status = 404;
    throw error;
  }

  return deletedConfig;
};

/**
 * Get minimal configuration
 * @param {string} merchant_id - Merchant ID
 * @returns {Promise<Object>} Minimal config
 */
export const getMinimalConfig = async (merchant_id) => {
  const config = await AdminConfig.findById(merchant_id);

  if (!config) {
    const error = new Error(
      `Configuration for merchant_id ${merchant_id} not found`
    );
    error.status = 404;
    throw error;
  }

  return buildMinimalConfig(config);
};

/**
 * Update minimal configuration fields
 * @param {string} merchant_id - Merchant ID
 * @param {Object} updates - Fields to update
 * @param {Object} user - User making the update
 * @returns {Promise<Object>} { updateCount, config, minimalConfig }
 */
export const updateMinimalConfig = async (merchant_id, updates, user) => {
  const config = await AdminConfig.findById(merchant_id);

  if (!config) {
    const error = new Error(
      `Configuration for merchant_id ${merchant_id} not found`
    );
    error.status = 404;
    throw error;
  }

  // Track if any updates were made
  let updateCount = 0;

  // Iterate through all sections and update matching fields
  Object.entries(config.sections).forEach(([_, section]) => {
    if (!section?.fields || !Array.isArray(section.fields)) return;

    section.fields.forEach((field) => {
      // If this field key exists in the updates, update its current_value
      if (
        field.key &&
        Object.prototype.hasOwnProperty.call(updates, field.key)
      ) {
        field.current_value = updates[field.key];
        updateCount++;
      }
    });
  });

  if (updateCount === 0) {
    const error = new Error("No valid fields to update");
    error.status = 400;
    throw error;
  }

  // Update audit trail
  config.meta.audit.last_updated_at = new Date();
  config.meta.audit.change_count = (config.meta.audit.change_count || 0) + 1;
  if (user) {
    config.meta.audit.last_updated_by = {
      user_id: user.id,
      full_name: user.name,
      email: user.email,
    };
  }

  await config.save();

  // Build full flattened minimal config after updates
  const minimalConfig = buildMinimalConfig(config);

  return { updateCount, config, minimalConfig };
};

/**
 * Reset specific fields to factory values
 * @param {string} merchant_id - Merchant ID
 * @param {Array<string>} fields - Field keys to reset
 * @returns {Promise<Object>} { resetCount, config }
 */
export const resetMinimalFields = async (merchant_id, fields) => {
  if (!fields || !Array.isArray(fields) || fields.length === 0) {
    const error = new Error(
      "fields array is required (e.g., ['chatbot_name', 'theme'])"
    );
    error.status = 400;
    throw error;
  }

  const config = await AdminConfig.findById(merchant_id);

  if (!config) {
    const error = new Error(
      `Configuration for merchant_id ${merchant_id} not found`
    );
    error.status = 404;
    throw error;
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
    const error = new Error("No valid fields to reset");
    error.status = 400;
    throw error;
  }

  // Update audit trail
  config.meta.audit.last_updated_at = new Date();
  config.meta.audit.change_count = (config.meta.audit.change_count || 0) + 1;
  config.meta.audit.last_change_summary = `Reset ${resetCount} field(s) to factory values`;

  await config.save();

  return { resetCount, config };
};

/**
 * Reset all fields to factory values
 * @param {string} merchant_id - Merchant ID
 * @param {Object} user - User making the reset
 * @returns {Promise<Object>} { resetCount, config, minimalConfig }
 */
export const resetAllMinimalFields = async (merchant_id, user) => {
  const config = await AdminConfig.findById(merchant_id);

  if (!config) {
    const error = new Error(
      `Configuration for merchant_id ${merchant_id} not found`
    );
    error.status = 404;
    throw error;
  }

  let resetCount = 0;

  // Iterate through all sections and reset ALL fields
  Object.entries(config.sections).forEach(([_, section]) => {
    if (!section?.fields || !Array.isArray(section.fields)) return;

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
  if (user) {
    config.meta.audit.last_updated_by = {
      user_id: user.id,
      full_name: user.name,
      email: user.email,
    };
  }

  await config.save();

  // Build and include flattened config after reset
  const minimalConfig = buildMinimalConfig(config);

  return { resetCount, config, minimalConfig };
};
