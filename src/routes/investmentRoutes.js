const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/investments/plans:
 *   get:
 *     summary: Obtain the available investment plans
 *     description: Returns the list of platform plans (Bronze, Silver, Gold).
 *     tags: [Investments]
 *     responses:
 *       200:
 *         description: Successfully retrieved list
 */
router.get('/plans', investmentController.getPlans);

/**
 * @swagger
 * /api/investments/:
 *   get:
 *     summary: Obtain your active investments
 *     description: Returns the user's personal investment plans. Requires JWT Token.
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved list
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, investmentController.getUserInvestments);

/**
 * @swagger
 * /api/investments/checkout:
 *   post:
 *     summary: Create an investment intent with Stripe Checkout
 *     description: Creates a Checkout Session in Stripe and returns the checkoutUrl where the user should be redirected to pay. Requires JWT Token.
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *               - amount
 *               - paymentMethod
 *             properties:
 *               planId:
 *                 type: integer
 *                 example: 1
 *               amount:
 *                 type: number
 *                 example: 5000
 *               paymentMethod:
 *                 type: string
 *                 example: Tarjeta Débito
 *     responses:
 *       201:
 *         description: Intent successfully created. Returns the redirect URL for Stripe Checkout.
 *       400:
 *         description: Amount not matching plan limitations
 */
router.post('/checkout', authMiddleware, investmentController.createInvestmentIntent);

/**
 * @swagger
 * /api/investments/confirm:
 *   post:
 *     summary: Complete investment confirmation
 *     description: Updates an investment to active when paid. Requires JWT Token.
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stripePaymentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/confirm', authMiddleware, investmentController.confirmInvestment);


module.exports = router;
