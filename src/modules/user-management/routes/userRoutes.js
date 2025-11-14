import express from "express";
import { createUser, getUsers } from "../controllers/userController.js";
import { checkPermission } from "../../../middleware/checkPermission.js";
import { verifyToken } from "../../../middleware/verifyToken.js";

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstName
 *         - email
 *         - password
 *         - role
 *       properties:
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Doe
 *         email:
 *           type: string
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: StrongPass@123
 *         role:
 *           type: string
 *           enum: [super_admin, merchant_admin, finance]
 *           example: merchant_admin
 *         permissions:
 *           type: object
 *           additionalProperties:
 *             type: array
 *             items:
 *               type: string
 *           example:
 *             userManagement: ["read", "write"]
 *             finance: ["read"]
 *             adminPanel: ["read", "write"]
 *             dashboard: ["read"]
 *         status:
 *           type: string
 *           enum: [active, suspended, deactivated]
 *           default: active
 *         twoFA_enabled:
 *           type: boolean
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: >
 *       Creates a new user with a default random password, sends a verification email with a 7-day expiry token,
 *       and returns the user details (excluding sensitive fields).
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - email
 *               - role
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Dheeraj
 *               lastName:
 *                 type: string
 *                 example: Kulkarni
 *               email:
 *                 type: string
 *                 format: email
 *                 example: dheeraj.kulkarni@example.com
 *               role:
 *                 type: string
 *                 enum: [super_admin, merchant_admin, finance]
 *                 example: merchant_admin
 *               tenant_id:
 *                 type: string
 *                 description: Optional tenant ID if multi-tenant setup
 *                 example: 64f4e8d3a2f5123456789abc
 *               is_super_admin:
 *                 type: boolean
 *                 example: false
 *               is_system_user:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: User created successfully and verification email sent.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User created successfully and verification email sent
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 672b5adf96a8a3b1d04b4456
 *                     firstName:
 *                       type: string
 *                       example: Dheeraj
 *                     lastName:
 *                       type: string
 *                       example: Kulkarni
 *                     email:
 *                       type: string
 *                       example: dheeraj.kulkarni@example.com
 *                     role:
 *                       type: string
 *                       example: merchant_admin
 *                     tenant_id:
 *                       type: string
 *                       example: 64f4e8d3a2f5123456789abc
 *                     isVerified:
 *                       type: boolean
 *                       example: false
 *                     isDefaultPassword:
 *                       type: boolean
 *                       example: true
 *                     status:
 *                       type: string
 *                       example: active
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-11-06T10:45:12.345Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-11-06T10:45:12.345Z
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Validation failed
 *       409:
 *         description: User with this email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User with this email already exists
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */

const router = express.Router();

/**
 * POST /api/users
 * @summary Create new user
 * @tags Users
 * @param {User} request.body.required - User Info
 * @return {User} 201 - created
 */
// POST /api/users
router.post("/", createUser);

/**
 * GET /api/users
 * @summary Get all users
 * @tags Users
 * @return {array<User>} 200 - success response
 */
// GET /api/users
router.get(
  "/",
  verifyToken,
  checkPermission("userManagement", "read"),
  getUsers
);

export default router;
