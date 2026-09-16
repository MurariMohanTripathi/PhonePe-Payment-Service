const express = require("express");
const {
    handlePhonePeWebhook,
}= require(
    "../controllers/webhook.controller"
);
/**
 * @swagger
 * /api/v1/webhooks/phonepe:
 *   post:
 *     summary: Receive PhonePe payment webhook
 *     description: |
 *       Endpoint used by PhonePe to notify the payment service
 *       when a payment completes or fails.
 *
 *       This endpoint is intended for PhonePe servers,
 *       not normal client applications.
 *
 *     tags:
 *       - Webhooks
 *
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *
 *       401:
 *         description: Invalid webhook signature
 *
 *       500:
 *         description: Webhook processing failed
 */
const router = express.Router(); 
router.post(
    "/phonepe",
    handlePhonePeWebhook
);

module.exports = router;
