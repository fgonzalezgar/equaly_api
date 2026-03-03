const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateRegistration } = require('../middlewares/validateRequest');

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Registers a new user with their form information and stores them in the Supabase PostgreSQL database.
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
 *                 format: email
 *                 example: tu@email.com
 *               acceptedTerms:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: User registered successfully
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
 *                   example: Usuario registrado exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     first_name:
 *                       type: string
 *                       example: Juan
 *                     last_name:
 *                       type: string
 *                       example: Perez
 *                     country:
 *                       type: string
 *                       example: Ecuador (+593)
 *                     email:
 *                       type: string
 *                       example: tu@email.com
 *                     accepted_terms:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Internal server error
 */
router.post('/register', validateRegistration, userController.registerUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all registered users
 *     description: Retrieves a list of all users that have registered via the form, ordered by most recent first.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Successful retrieval of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       first_name:
 *                         type: string
 *                         example: Juan
 *                       last_name:
 *                         type: string
 *                         example: Perez
 *                       country:
 *                         type: string
 *                         example: Ecuador (+593)
 *                       email:
 *                         type: string
 *                         example: tu@email.com
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/', userController.getUsers);

module.exports = router;
