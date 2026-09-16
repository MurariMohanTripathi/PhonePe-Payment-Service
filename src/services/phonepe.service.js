const axios = require("axios");
const env = require("../config/env");

let cachedToken = null;
let tokenExpiresAt = 0;


const getAccessToken = async () => {
  const currentTime = Math.floor(Date.now()/1000);
  if(
    cachedToken &&
    tokenExpiresAt &&
    currentTime < tokenExpiresAt - 60
  ){
    return cachedToken;
  }
  try {
    const body = new URLSearchParams();
    body.append("client_id", env.phonepe.clientId);
    body.append("client_version", env.phonepe.clientVersion);
    body.append("client_secret", env.phonepe.clientSecret);
    body.append("grant_type", "client_credentials");
    const response = await axios.post(env.phonepe.authUrl, body.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    cachedToken = response.data.access_token;
    tokenExpiresAt = response.data.expires_at;
    return cachedToken;
  } catch (error) {
    console.error(
      "PhonePe authentication failed:",
      error.response?.data || error.message,
    );

    throw new Error("Unable to authenticate with PhonePe");
  }
};

const createPayment = async({
  merchantOrderId,
  amount,
  redirectUrl,
  message,
}) =>{
  try{
    const accessToken = await getAccessToken();
    const requestBody = {
      merchantOrderId,
      amount,

      expireAfter:1200,
      paymentFlow:{
        type: "PG_CHECKOUT",
        message :
          message || "Payment",
        merchantUrls:{
          redirectUrl,
        },
      },
    };
    const response = await axios.post(
      env.phonepe.paymentUrl,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `O-Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "PhonePe payment creation failed:",
      error.response?.data || error.message,
    );

    throw new Error("Unable to create PhonePe payment");
  }
};
const getOrderStatus = async (merchantOrderId) =>{
  try{
    const accessToken = await getAccessToken();
    const url = `${env.phonepe.statusBaseUrl}/${merchantOrderId}/status`;
    const response = await axios.get(
      url,
      {
        headers:{
          "Content-Type" :"application/json",
          Authorization: `O-Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  }catch(error){
    console.error("PhonePe Order Status Error :",error.response?.data || error.message);
    const err = new Error("Unable to fetch PhonePe payment status");
    err.status = error.response?.status ||500;
    err.phonePeError = error.response?.data;
    throw err;
  }
}

module.exports = {
  getAccessToken,
  createPayment,
  getOrderStatus,
};
