/**
 * @swagger
 * tags:
 *   name: AdminConfig
 *   description: Admin configuration management APIs for merchant-specific settings
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     AdminConfig:
 *       type: object
 *       description: Full admin configuration document used for dynamic UI rendering
 *       properties:
 *         _id:
 *           type: string
 *           description: Merchant (tenant) identifier (also stored as merchant_id)
 *         sections:
 *           type: object
 *           additionalProperties:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               fields:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                     label:
 *                       type: string
 *                     type:
 *                       type: string
 *                     factory_value:
 *                       description: Original default value
 *                     current_value:
 *                       description: Current active value
 *                     access_role:
 *                       type: string
 *                     showInfoIcon:
 *                       type: boolean
 *                     infoText:
 *                       type: string
 *     MinimalConfig:
 *       type: object
 *       description: Flattened key-value representation (field.key -> field.current_value)
 *       additionalProperties: true
 *       example:
 *         chatbot_name: "Opura Assistant"
 *         theme: "light"
 *         temperature: 0.7
 */

// /**
//  * @swagger
//  * /api/bot-config:
//  *   post:
//  *     summary: Create a new admin configuration
//  *     tags: [AdminConfig]
//  *     description: Create a new configuration for a merchant (super_admin only)
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/AdminConfig'
//  *     responses:
//  *       201:
//  *         description: Configuration created successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                 message:
//  *                   type: string
//  *                 data:
//  *                   $ref: '#/components/schemas/AdminConfig'
//  *       409:
//  *         description: Configuration already exists
//  *       500:
//  *         description: Server error
//  */

// /**
//  * @swagger
//  * /api/bot-config:
//  *   get:
//  *     summary: Get all admin configurations (paginated)
//  *     tags: [AdminConfig]
//  *     description: Retrieve all configurations with pagination (super_admin only)
//  *     parameters:
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *           default: 1
//  *         description: Page number
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *           default: 10
//  *         description: Items per page
//  *       - in: query
//  *         name: search
//  *         schema:
//  *           type: string
//  *         description: Search by merchant_id
//  *     responses:
//  *       200:
//  *         description: Configurations retrieved successfully
//  *       500:
//  *         description: Server error
//  */

/**
 * @swagger
 * /api/bot-config/{merchant_id}:
 *   get:
 *     summary: Get full admin configuration by merchant_id
 *     tags: [AdminConfig]
 *     description: Retrieve complete configuration for dynamic UI generation. If authenticated, returns logged-in user details from token.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: merchant_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Merchant ID
 *         example: merchant_12345
 *     responses:
 *       200:
 *         description: Configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/AdminConfig'
 *                 user:
 *                   type: object
 *                   nullable: true
 *                   description: Authenticated user details (from JWT token) or null if not authenticated
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                       description: Combined firstName and lastName from User table
 *                     email:
 *                       type: string
 *       404:
 *         description: Configuration not found
 *       500:
 *         description: Server error
 */

// /**
//  * @swagger
//  * /api/bot-config/{merchant_id}:
//  *   put:
//  *     summary: Update admin configuration by merchant_id
//  *     tags: [AdminConfig]
//  *     description: Update existing configuration (full or partial update)
//  *     parameters:
//  *       - in: path
//  *         name: merchant_id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Merchant ID
//  *         example: merchant_12345
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/AdminConfig'
//  *     responses:
//  *       200:
//  *         description: Configuration updated successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                 message:
//  *                   type: string
//  *                 data:
//  *                   $ref: '#/components/schemas/AdminConfig'
//  *       404:
//  *         description: Configuration not found
//  *       500:
//  *         description: Server error
//  */

/**
 * @swagger
 * /api/bot-config/{merchant_id}:
 *   delete:
 *     summary: Delete admin configuration by merchant_id
 *     tags: [AdminConfig]
 *     description: Delete configuration (super_admin only). User details are automatically extracted from JWT token (Authorization Bearer token required). No request body needed.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: merchant_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Merchant ID
 *         example: merchant_12345
 *     responses:
 *       200:
 *         description: Configuration deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     merchant_id:
 *                       type: string
 *                 user:
 *                   type: object
 *                   description: User details extracted from JWT token
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                       description: Combined firstName and lastName from User table
 *                     email:
 *                       type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Configuration not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/bot-config/minimal/{merchant_id}:
 *   get:
 *     summary: Get minimal configuration for chatbot initialization
 *     tags: [AdminConfig]
 *     description: Dynamically extracts ALL fields as flat key-value pairs (field.key -> field.current_value) from all sections. If authenticated, returns logged-in user details from token.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: merchant_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Merchant ID
 *         example: merchant_12345
 *     responses:
 *       200:
 *         description: Minimal configuration retrieved successfully (returns ALL ~40+ fields)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 merchant_id:
 *                   type: string
 *                 config:
 *                   $ref: '#/components/schemas/MinimalConfig'
 *                 user:
 *                   type: object
 *                   nullable: true
 *                   description: Authenticated user details (from JWT token) or null if not authenticated
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                       description: Combined firstName and lastName from User table
 *                     email:
 *                       type: string
 *       404:
 *         description: Configuration not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/bot-config/minimal/{merchant_id}:
 *   patch:
 *     summary: Update minimal configuration (flat structure)
 *     tags: [AdminConfig]
 *     description: Update specific fields using flat key-value pairs. User details are automatically extracted from JWT token (Authorization Bearer token required). No user object needed in request body.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: merchant_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Merchant ID
 *         example: merchant_12345
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *             description: Flat key-value pairs of fields to update (no user object needed)
 *             example:
 *               chatbot_name: "Updated Bot Name"
 *               theme: "dark"
 *               temperature: 0.8
 *     responses:
 *       200:
 *         description: Configuration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 updates_applied:
 *                   type: number
 *                 merchant_id:
 *                   type: string
 *                 config:
 *                   $ref: '#/components/schemas/MinimalConfig'
 *                 user:
 *                   type: object
 *                   description: User details extracted from JWT token
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                       description: Combined firstName and lastName from User table
 *                     email:
 *                       type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Configuration not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/bot-config/minimal/{merchant_id}/reset:
 *   post:
 *     summary: Reset ALL fields to factory values
 *     tags: [AdminConfig]
 *     description: Resets every field's current_value to its factory_value. User details are automatically extracted from JWT token (Authorization Bearer token required). No request body needed.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: merchant_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Merchant ID
 *         example: merchant_12345
 *     responses:
 *       200:
 *         description: All fields reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 fields_reset:
 *                   type: number
 *                 merchant_id:
 *                   type: string
 *                 config:
 *                   $ref: '#/components/schemas/MinimalConfig'
 *                 user:
 *                   type: object
 *                   description: User details extracted from JWT token
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                       description: Combined firstName and lastName from User table
 *                     email:
 *                       type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Configuration not found
 *       500:
 *         description: Server error
 */

import express from "express";
import {
  // getAllConfigs,
  // createConfig,
  getFullConfig,
  // updateFullConfig,
  deleteConfig,
  // createMinimalConfig,
  getMinimalConfig,
  updateMinimalConfig,
  resetAllMinimalFields
} from "../controllers/adminConfigController.js";
import { authenticateToken, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/bot-config - Get all configurations (paginated)
// router.get("/", getAllConfigs);

// POST /api/bot-config - Create new configuration
// router.post("/", createConfig);

// GET /api/bot-config/:merchant_id - Get full configuration (optional auth)
router.get("/:merchant_id", optionalAuth, getFullConfig);

// PUT /api/bot-config/:merchant_id - Update configuration
// router.put("/:merchant_id", updateFullConfig);

// DELETE /api/bot-config/:merchant_id - Delete configuration (requires auth)
router.delete("/:merchant_id", authenticateToken, deleteConfig);

// POST /api/bot-config/minimal - Create config from minimal structure (not recommended)
// router.post("/minimal", createMinimalConfig);

// GET /api/bot-config/minimal/:merchant_id - Get minimal config for chatbot (optional auth)
router.get("/minimal/:merchant_id", optionalAuth, getMinimalConfig);

// PATCH /api/bot-config/minimal/:merchant_id - Update minimal config (requires auth)
router.patch("/minimal/:merchant_id", authenticateToken, updateMinimalConfig);

// POST /api/bot-config/minimal/:merchant_id/reset - Reset fields to factory values (requires auth)
router.post("/minimal/:merchant_id/reset", authenticateToken, resetAllMinimalFields);

export default router;
