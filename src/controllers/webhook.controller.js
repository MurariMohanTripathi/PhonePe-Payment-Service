const webhookService = require("../services/webhook.service");
const paymentRepository = require("../repositories/payment.repository");

const handlePhonePeWebhook = async(req,res)=>{
    try{
        const keyId = req.headers["x-phonepe-checksum-key-id"];
        const signature = req.headers["x-phonepe-checksum-signature"];
        const rawBody = req.body;
        const isValid = webhookService.verifyPhonePeWebhook({rawBody,keyId,signature});
        if(!isValid){
            console.warn("Rejected invalid Phone webhook");
            return res.status(401).json({
                success:false,
                message:"Invalid webhook signature",
            });
        }
    const webhook = JSON.parse(rawBody.toString("utf8"));
    const {event,payload,} = webhook;
    console.log("PhonePe webhook:",event,payload?.merchantOrderId);
    if (event !=="checkout.order.completed" && event !=="checkout.order.failed") {
        return res
          .status(200)
          .json({
            success: true,
            message:"Webhook ignored",
          });
      }
      if (!payload || !payload.merchantOrderId) {
        return res
          .status(400)
          .json({
            success: false,
            message:"Invalid webhook payload",
          });
      }
      const merchantOrderId = payload.merchantOrderId;
      const payment = await paymentRepository.findByMerchantOrderId(merchantOrderId);
       if (!payment) {
        console.warn("Webhook payment not found:",merchantOrderId);
        // Return 200 so PhonePe does not
        // keep retrying an unknown payment
        return res
          .status(200)
          .json({
            success: true,
            message:"Payment not found",
          });
      }
      // PhonePe specifically recommends
      // using payload.state for payment status

      const newStatus = payload.state;
      // Idempotency:
      // webhook may arrive multiple times

      if (payment.status === newStatus) {
        return res
          .status(200)
          .json({
            success: true,
            message:"Webhook already processed",
          });
      }
      await paymentRepository
        .updatePaymentStatus({
          merchantOrderId,
          status: newStatus,
        });


      console.log(`Payment ${merchantOrderId} updated to ${newStatus}`);

      return res
        .status(200)
        .json({
          success: true,
          message:"Webhook processed",
        });

    }catch (error) {

      console.error("Webhook processing error:",error);
      return res
        .status(500)
        .json({
          success: false,
          message:
            "Webhook processing failed",
        });
    }
  };
  module.exports = {
  handlePhonePeWebhook,
};
    
