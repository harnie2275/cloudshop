const { default: axios } = require("axios");

exports.convertToCLDX = async (amount) => {
  var config2 = {
    method: "get",
    url: `https://api.flutterwave.com/v3/rates?from=NGN&to=USD&amount=${amount}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer FLWSECK-c67abb2869dab7a8ae3f95c69ad5e90e-X",
    },
  };

  let rate = await axios(config2);
  const usdConverted = rate.data.data.rate;
  return parseFloat(usdConverted / 100) / 0.001;
};
