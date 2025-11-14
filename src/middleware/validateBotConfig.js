import { z } from "zod";
import AdminConfig from "../modules/admin-config/models/Config.js";

/**
 * Middleware to validate bot-config updates based on field mandatory flags
 * Dynamically fetches the config schema and validates required fields
 */
export const validateBotConfigUpdate = async (req, res, next) => {
  try {
    const { merchant_id } = req.params;
    const updates = req.body;

    // Fetch the current config to get field definitions
    const config = await AdminConfig.findById(merchant_id);

    if (!config) {
      return res.status(404).json({
        success: false,
        message: `Configuration for merchant_id ${merchant_id} not found`,
      });
    }

    // Build a map of all fields with their metadata
    const fieldMap = new Map();
    
    Object.entries(config.sections).forEach(([sectionKey, section]) => {
      if (!section?.fields || !Array.isArray(section.fields)) return;
      
      section.fields.forEach((field) => {
        if (field.key) {
          fieldMap.set(field.key, {
            key: field.key,
            label: field.label,
            type: field.type,
            mandatory: field.mandatory || false,
            maxLength: field.maxLength,
            options: field.options,
            section: sectionKey,
          });
        }
      });
    });

    // Validate each update field
    const validationErrors = [];
    const updateKeys = Object.keys(updates);

    // If no fields to update, continue
    if (updateKeys.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update",
      });
    }

    // Check each field being updated
    for (const key of updateKeys) {
      const fieldDef = fieldMap.get(key);
      const value = updates[key];

      // Check if field exists in schema
      if (!fieldDef) {
        validationErrors.push({
          field: key,
          message: `Field '${key}' is not defined in the configuration schema`,
        });
        continue;
      }

      // Validate mandatory fields - they must not be null, undefined, or empty
      if (fieldDef.mandatory) {
        const zodSchema = buildFieldValidation(fieldDef);
        const result = zodSchema.safeParse(value);
        
        if (!result.success) {
          validationErrors.push({
            field: key,
            label: fieldDef.label,
            message: `'${fieldDef.label}' is mandatory and must be provided`,
            section: fieldDef.section,
            errors: result.error.flatten().formErrors,
          });
        }
      } else {
        // For optional fields, validate type if value is provided
        if (value !== null && value !== undefined) {
          const zodSchema = buildFieldValidation(fieldDef, false);
          const result = zodSchema.safeParse(value);
          
          if (!result.success) {
            validationErrors.push({
              field: key,
              label: fieldDef.label,
              message: `Invalid value for '${fieldDef.label}'`,
              section: fieldDef.section,
              errors: result.error.flatten().formErrors,
            });
          }
        }
      }
    }

    // If validation errors exist, return them
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Validation passed, continue to controller
    next();
  } catch (err) {
    console.error("❌ Validation middleware error:", err);
    res.status(500).json({
      success: false,
      message: "Error validating configuration",
      error: err.message,
    });
  }
};

/**
 * Build Zod validation schema based on field definition
 * @param {Object} fieldDef - Field definition from config
 * @param {boolean} isMandatory - Whether the field is mandatory
 * @returns {z.ZodSchema} Zod schema for validation
 */
function buildFieldValidation(fieldDef, isMandatory = true) {
  let schema;

  switch (fieldDef.type) {
    case "text":
    case "textarea":
      schema = z.string();
      if (isMandatory) {
        schema = schema.min(1, `${fieldDef.label} cannot be empty`);
      }
      if (fieldDef.maxLength) {
        schema = schema.max(
          fieldDef.maxLength,
          `${fieldDef.label} must not exceed ${fieldDef.maxLength} characters`
        );
      }
      break;

    case "number":
    case "slider":
      schema = z.number({
        required_error: `${fieldDef.label} must be a number`,
        invalid_type_error: `${fieldDef.label} must be a number`,
      });
      break;

    case "toggle":
      schema = z.boolean({
        required_error: `${fieldDef.label} must be true or false`,
        invalid_type_error: `${fieldDef.label} must be a boolean`,
      });
      break;

    case "dropdown":
      if (fieldDef.options && fieldDef.options.length > 0) {
        schema = z.enum(fieldDef.options, {
          errorMap: () => ({
            message: `${fieldDef.label} must be one of: ${fieldDef.options.join(", ")}`,
          }),
        });
      } else {
        schema = z.string();
        if (isMandatory) {
          schema = schema.min(1, `${fieldDef.label} is required`);
        }
      }
      break;

    case "color":
      schema = z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
        message: `${fieldDef.label} must be a valid hex color (e.g., #FF5733)`,
      });
      break;

    case "image":
      schema = z.string().url({
        message: `${fieldDef.label} must be a valid URL`,
      });
      break;

    case "list":
      schema = z.array(z.string(), {
        required_error: `${fieldDef.label} must be an array`,
        invalid_type_error: `${fieldDef.label} must be an array`,
      });
      if (isMandatory) {
        schema = schema.min(1, `${fieldDef.label} must contain at least one item`);
      }
      break;

    case "voice_preview":
      // Voice preview can be string or object with voice settings
      schema = z.union([
        z.string(),
        z.object({
          voice: z.string().optional(),
          model: z.string().optional(),
        }),
      ]);
      break;

    default:
      // Generic fallback - accept any type
      schema = z.any();
      if (isMandatory) {
        schema = z.any().refine((val) => val !== null && val !== undefined, {
          message: `${fieldDef.label} is required`,
        });
      }
  }

  // Make optional if not mandatory
  if (!isMandatory) {
    schema = schema.optional().nullable();
  }

  return schema;
}
