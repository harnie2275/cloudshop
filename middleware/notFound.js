const { respondWithError } = require("../utils/response");

const notFound = (req, res) =>
  respondWithError(res, [], "Route Not Found", 404);

module.exports = notFound;
