const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateRegistration, validateLogin } = require('../middlewares/validateRequest');

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Registers a new user. Supports optional referral code.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - country
 *               - password
 *               - email
 *               - acceptedTerms
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Juan
 *               lastName:
 *                 type: string
 *                 example: Perez
 *               country:
 *                 type: string
 *                 example: Ecuador
 *               password:
 *                 type: string
 *                 example: Secreta123!
 *               email:
 *                 type: string
 *                 example: tu@email.com
 *               acceptedTerms:
 *                 type: boolean
 *                 example: true
 *               referredByCode:
 *                 type: string
 *                 example: REF123
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', validateRegistration, userController.registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticates a user and returns a JWT token plus referral information.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: tu@email.com
 *               password:
 *                 type: string
 *                 example: Secreta123!
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', validateLogin, userController.loginUser);

/**
 * @swagger
 * /api/users/referrals:
 *   get:
 *     summary: Get user's referral list
 *     description: Returns a list of users who registered using this user's referral code. Requires JWT.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/referrals', authMiddleware, userController.getReferrals);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all registered users
 *     description: Admin view of all users.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', userController.getUsers);

module.exports = router;
