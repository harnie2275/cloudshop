const respondWithSuccess = (
  res,
  payload = [],
  message = "successful",
  status = 200
) => {
  return res.status(status).json({
    status: true,
    message,
    payload,
    nbHits: payload.length,
  });
};
const respondWithError = (
  res,
  payload = [],
  message = "error",
  status = 500
) => {
  return res.status(status).json({
    status: false,
    message,
    payload,
    nbHits: payload.length,
  });
};

module.exports = { respondWithSuccess, respondWithError };
