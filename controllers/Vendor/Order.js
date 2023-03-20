const asyncHandler = require("express-async-handler");
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const {
  respondWithSuccess,
  respondWithError,
} = require("../../utils/response");

exports.getVendorOrders = asyncHandler(async (req, res) => {
  const vendor = req.vendor;

  const products = await Product.find({ addedBy: vendor?._id });

  const orders = await Order.find();

  const vendorOrders = orders.filter((order) =>
    order.items.some((item) =>
      products.map((product) => product?._id?.toString()).includes(item.id)
    )
  );

  if (vendorOrders) {
    return respondWithSuccess(res, vendorOrders, "Fetched", 200);
  } else {
    return respondWithError(res, [], "An error occured", 400);
  }
});
