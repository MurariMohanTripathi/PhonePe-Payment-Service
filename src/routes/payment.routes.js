const express = require("express");
const{
    testAuthentication,
    createPayment,
    getPaymentStatus,
} = require("../controllers/payment.controller");

const router = express.Router();
/**
 * @swagger
 * /api/v1/phonepe/auth-test:
 *   get:
 *     summary: Test PhonePe authentication
 *     tags:
 *       - Payments
 *     responses:
 *       200:
 *         description: PhonePe authentication successful
 *       500:
 *         description: PhonePe authentication failed
 */
router.get("/auth-test",testAuthentication);

/**
 * @swagger
 * /api/v1/phonepe/payments/{merchantOrderId}:
 *   get:
 *     summary: Get payment status
 *     description: Retrieves the latest payment status from PhonePe and updates the local database.
 *     tags:
 *       - Payments
 *
 *     parameters:
 *       - in: path
 *         name: merchantOrderId
 *         required: true
 *         schema:
 *           type: string
 *         example: PAY_1789528304400_7aee7201
 *
 *     responses:
 *       200:
 *         description: Payment status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 payment:
 *                   type: object
 *                   properties:
 *                     merchantOrderId:
 *                       type: string
 *
 *                     phonePeOrderId:
 *                       type: string
 *
 *                     amount:
 *                       type: integer
 *                       example: 10000
 *
 *                     currency:
 *                       type: string
 *                       example: INR
 *
 *                     status:
 *                       type: string
 *                       example: COMPLETED
 *
 *                     provider:
 *                       type: string
 *                       example: PHONEPE
 *
 *       404:
 *         description: Payment not found
 *
 *       500:
 *         description: Unable to retrieve payment status
 */
router.get(
  "/payments/:merchantOrderId",
  getPaymentStatus
);
/**
 * @swagger
 * /api/v1/phonepe/payments:
 *   post:
 *     summary: Create PhonePe checkout payment
 *     tags:
 *       - Payments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - redirectUrl
 *             properties:
 *               amount:
 *                 type: integer
 *                 example: 1000
 *                 description: Amount in paisa. 1000 means Rs. 10.
 *               redirectUrl:
 *                 type: string
 *                 example: http://localhost:3000/payment-success
 *               message:
 *                 type: string
 *                 example: Payment for order
 *     responses:
 *       201:
 *         description: Payment created successfully
 *       400:
 *         description: Invalid payment request
 *       500:
 *         description: Unable to create payment
 */
router.post(
    "/payments",
    createPayment
);
router.get("/payments/:merchantOrderId",getPaymentStatus);
module.exports = router;
