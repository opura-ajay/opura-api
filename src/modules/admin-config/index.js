/**
 * Admin Config Module
 * Exports all admin configuration components
 */

export { default as configRoutes } from "./routes/configRoutes.js";
export { default as AdminConfig } from "./models/Config.js";
export * as configController from "./controllers/configController.js";
export * as configService from "./services/configService.js";
