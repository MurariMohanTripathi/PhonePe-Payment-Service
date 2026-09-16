const express = require("express");
const{
    testAuthentication,
    createPayment,
    getPaymentStatus,
} = require("../controllers/payment.controller");

const router = express.Router();
router.get("/auth-test",testAuthentication);

router.post(
    "/payments",
    createPayment
);
router.get("/payments/:merchantOrderId",getPaymentStatus);
module.exports = router;