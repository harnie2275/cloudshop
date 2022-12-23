const { PAYSTACK_SECRET } = require("../../../config/env");
const axios = require("axios");

const verifyPayment = async (reference) => {
  var config = {
    method: "get",
    url: `https://api.paystack.co/transaction/verify/${reference}`,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
    },
  };
  try {
    const { data } = await axios(config);
    const payment = data.data;
    return { status: true, payment };
  } catch (error) {
    return { status: false, message: error.message };
  }
};

module.exports = { verifyPayment };
