const crypto = require("crypto");
const env = require("../config/env");

const verifyPhonePeWebhook = ({ rawBody, keyId, signature }) => {
  if (!rawBody) {
    return false;
  }
  if (!keyId || !signature) {
    return false;
  }
  if (keyId !== env.phonepe.webhookKeyId) {
    return false;
  }
  const generatedSignature = crypto
    .createHmac("sha256", env.phonepe.webhookSecret)
    .update(rawBody)
    .digest("base64");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(signature),
    );
  } catch {
    return false;
  }
};
module.exports = {
    verifyPhonePeWebhook,
};
