/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication related APIs
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     description: Authenticate user using email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */

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
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
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

import express from "express";
import { createUser, getUsers } from "../controllers/userController.js";
import { loginUser } from "../controllers/authController.js";

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
router.get("/", getUsers);

/**
 * POST /api/users/login
 * @summary User login
 * @tags Users
 * @param {object} request.body.required - Login credentials
 * @property {string} email.required - User email
 * @property {string} password.required - User password
 * @return {object} 200 - Login successful
 * @return {object} 401 - Invalid credentials
 */
router.post("/login", loginUser);

export default router;
