const express = require("express");
const {
    handlePhonePeWebhook,
}= require(
    "../controllers/webhook.controller"
);

const router = express.Router(); 
router.post(
    "/phonepe",
    handlePhonePeWebhook
);

module.exports = router;