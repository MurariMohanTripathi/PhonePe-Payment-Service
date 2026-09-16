const phonePeService = require("../services/phonepe.service");
const crypto = require("crypto");
const paymentRepository = require("../repositories/payment.repository");

const testAuthentication = async (req, res) => {
  try {
    await phonePeService.getAccessToken();
    res.status(200).json({
      success: true,
      message: "PhonePe authentication successfull",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      phonePeError: error.phonePeError,
    });
  }
};

const createPayment = async (req, res) => {
  try {
    const { amount, redirectUrl, message } = req.body;
    if (!Number.isInteger(amount) || amount < 100) {
      return res.status(400).json({
        success: false,
        message: "Amount must be an integer in paisa and at least 100.",
      });
    }
    if (!redirectUrl) {
      return res.status(400).json({
        success: false,
        message: "redirectUrl is required",
      });
    }

    const merchantOrderId = `PAY_${Date.now()}_${crypto
      .randomBytes(4)
      .toString("hex")}`;

    await paymentRepository.createPayment({
      merchantOrderId,
      amount,
      redirectUrl,
    });

    const phonePeResponse = await phonePeService.createPayment({
      merchantOrderId,
      amount,
      redirectUrl,
      message,
    });
    const savedPayment =
      await paymentRepository.updatePaymentAfterPhonePeCreation({
        merchantOrderId,
        phonePeOrderId: phonePeResponse.orderId,
        status: phonePeResponse.state,
      });

    return res.status(201).json({
      success: true,

      message: "Payment Created Successfully",
      payment: {
        merchantOrderId: savedPayment.merchant_order_id,
        phonePeOrderId: savedPayment.phonepe_order_id,
        amount: Number(savedPayment.amount),
        currency: savedPayment.currency,
        status: savedPayment.status,
        redirectUrl: phonePeResponse.redirectUrl,
        expireAt: phonePeResponse.expireAt,
      },
    });
  } catch (error) {
    console.error("Create Payment Error:",error);

    return res
      .status(error.status || 500)
      .json({
        success: false,
        message: error.message ||"Unable to create payment",

        phonePeError: error.phonePeError || undefined,
      });
  }
};
const getPaymentStatus = async (req, res) => {

    try {
      const {merchantOrderId,} = req.params;
      // 1. Find our local payment

      const localPayment =
        await paymentRepository.findByMerchantOrderId(merchantOrderId);

      if (!localPayment) {
        return res.status(404).json({
          success: false,
          message:"Payment not found",
        });
      }
      // 2. Ask PhonePe for current status

      const phonePeResponse =
        await phonePeService
          .getOrderStatus( merchantOrderId);

      // 3. Update DB

      const updatedPayment =
        await paymentRepository
          .updatePaymentStatus({
            merchantOrderId,
            status:phonePeResponse.state,
          });

      // 4. Return normalized response

      return res.status(200).json({
        success: true,

        payment: {
          merchantOrderId: updatedPayment.merchant_order_id,
          phonePeOrderId: updatedPayment.phonepe_order_id,
          amount: Number(updatedPayment.amount),
          currency: updatedPayment.currency,
          status: updatedPayment.status,
          provider: updatedPayment.provider,
          createdAt: updatedPayment.created_at,
          updatedAt: updatedPayment.updated_at,
        },
        providerResponse: phonePeResponse,
      });
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({
          success: false,
          message:
            error.message,
          phonePeError:
            error.phonePeError ||
            undefined,
        });
    }
  };

module.exports = {
  testAuthentication,
  createPayment,
  getPaymentStatus,
};
