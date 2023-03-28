const asyncHandler = require("express-async-handler");
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const {
  respondWithSuccess,
  respondWithError,
} = require("../../utils/response");

exports.analytics = asyncHandler(async (req, res) => {
  const vendor = req.vendor;
  const startDate = req.query.start_date;
  const endDate = req.query.end_date;

  const products = await Product.find({ addedBy: vendor?._id });
  const orders = await Order.find({
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  });

  const vendorOrders = orders.filter((order) =>
    order.items.some((item) =>
      products.map((product) => product?._id?.toString()).includes(item.id)
    )
  );

  const vendorFilteredOutOrders = vendorOrders.map((vo) => {
    const doc = vo._doc;
    return {
      ...doc,
      items: doc.items.filter((i) =>
        products.map((product) => product?._id?.toString()).includes(i.id)
      ),
    };
  });

  const revenue = vendorFilteredOutOrders
    .map((c) =>
      c.items
        ?.filter((i) => i?.status !== "refunded")
        .reduce((a, b) => a + (b?.amount || 0), 0)
    )
    .reduce((a, b) => a + b, 0);

  const refunded = vendorFilteredOutOrders
    .map((c) => c?.items.filter((i) => i?.status === "refunded")?.length)
    .reduce((a, b) => a + b, 0);

  const delivered = vendorFilteredOutOrders
    .map((c) => c.items.filter((c) => c?.status === "delivered").length)
    .reduce((a, b) => a + b, 0);
  if (vendorFilteredOutOrders) {
    return respondWithSuccess(
      res,
      { revenue, orders: vendorFilteredOutOrders.length, refunded, delivered },
      "yup"
    );
  } else {
    return respondWithError(res, [], "An error occured", 500);
  }
});
