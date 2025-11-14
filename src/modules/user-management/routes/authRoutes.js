import { loginUser, verifyUser } from "../controllers/authController.js";
import express from "express";
const router = express.Router();

/**
 * @swagger
 * /api/login:
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
 * /api/verify:
 *   post:
 *     summary: User Verify
 *     tags: [Auth]
 *     description: Verify user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 example: Password123
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
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

/**
 * POST /api/users/verify
 * @summary Verify user account
 * @tags Users
 * @param {object} request.body.required - Verification data
 * @property {string} token.required - Verification token
 * @property {string} password.required - New password
 * @return {object} 200 - Verification successful
 */
router.post("/verify", verifyUser);

export default router;
