require("dotenv").config();

const isProduction = process.env.PHONEPE_ENV === "PRODUCTION";

const env = {
  port: process.env.PORT || 5000,
  database:{
    url:process.env.DATABASE_URL,
  },

  phonepe: {
    clientId: process.env.PHONEPE_CLIENT_ID,
    clientSecret: process.env.PHONEPE_CLIENT_SECRET,
    clientVersion: process.env.PHONEPE_CLIENT_VERSION,
    environment: process.env.PHONEPE_ENV || "SANDBOX",
    webhookKeyId: process.env.PHONEPE_WEBHOOK_KEY_ID,
    webhookSecret: process.env.PHONEPE_WEBHOOK_SECRET,

    authUrl: isProduction
      ? "https://api.phonepe.com/apis/identity-manager/v1/oauth/token"
      : "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token",

    paymentUrl: isProduction
      ? "https://api.phonepe.com/apis/pg/checkout/v2/pay"
      : "https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay",
    statusBaseUrl: isProduction
      ? "https://api.phonepe.com/apis/pg/checkout/v2/order"
      : "https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order",
  },
};

module.exports = env;
