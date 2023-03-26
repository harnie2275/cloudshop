const asyncHandler = require("express-async-handler");
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const getSearchParams = require("../../utils/getSearchParams");
const {
  respondWithSuccess,
  respondWithError,
} = require("../../utils/response");

exports.getVendorOrders = asyncHandler(async (req, res) => {
  const vendor = req.vendor;

  //   Get all vendor's products
  const products = await Product.find({ addedBy: vendor?._id });

  //   Get all orders
  const orders = await Order.find();

  //   Get vendor's orders from all vendor products and all orders
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
  console.log(vendorFilteredOutOrders);

  if (vendorFilteredOutOrders) {
    return respondWithSuccess(res, vendorFilteredOutOrders, "Fetched", 200);
  } else {
    return respondWithError(res, [], "An error occured", 400);
  }
});

exports.vendorGetSingleOrder = asyncHandler(async (req, res) => {
  const vendor = req.vendor;
  const orderId = req.params.id;

  const order = await Order.findOne({ orderId });

  if (!order) return respondWithError(res, [], "Order not found", 404);

  //   Get all vendor's products
  const products = await Product.find({ addedBy: vendor?._id });

  const productsIds = products.map((p) => p._id.toString());
  const isVendorOrder = order.items.some((item) =>
    productsIds.includes(item.id)
  );
  if (!isVendorOrder) return respondWithError(res, [], "Order not found", 404);

  const filterOutOtherProducts = {
    ...order._doc,
    items: order.items.filter((i) => productsIds.includes(i.id)),
  };

  return respondWithSuccess(res, filterOutOtherProducts, "Fetched", 200);
});

exports.vendorUpdateOrder = asyncHandler(async (req, res) => {
  const status = req.body.status;
  const updateStatuses = Array.from([
    "refunded",
    "shipped",
    "out for delivery",
    "delivered",
  ]);
  if (!updateStatuses.includes(status))
    return respondWithError(res, [], "Status not valid", 400);
  const productsToUpdate = req.body.products;
  if (!productsToUpdate)
    return respondWithError(
      res,
      [],
      "Please send a product or products to update"
    );

  const orderId = req.params.id;
  const vendor = req.vendor;
  const order = await Order.findOne({ orderId });
  if (!order) {
    return respondWithError(
      res,
      [],
      "Order does not exist or might have been deleted"
    );
  }

  const products = await Product.find({ addedBy: vendor._id });

  const productsIds = products.map((p) => p._id.toString());

  const isVendorOrder = order.items.some((item) =>
    productsIds.includes(item.id)
  );
  const VendorOnlyProducts = productsToUpdate.filter((p) =>
    productsIds.includes(p)
  );

  if (!isVendorOrder)
    return respondWithError(res, [], "Order does not exist on your account");

  const updateItems = VendorOnlyProducts.map(async (product) => {
    const updateItem = await Order.findOneAndUpdate(
      { orderId, "items.id": product },
      {
        $set: {
          "items.$.status": status,
          "items.$.updatedAt": new Date().toISOString(),
        },
      }
    );
    if (updateItem) {
      return { updated: true, product_id: product };
    } else return { updated: false, product_id: product };
  });

  const promisesResolved = await Promise.all(updateItems);

  console.log(
    promisesResolved,
    VendorOnlyProducts,
    productsIds,
    productsToUpdate
  );
  if (promisesResolved.some((items) => !items.updated)) {
    return respondWithError(
      res,
      promisesResolved,
      "Some items could not be updated",
      400
    );
  } else {
    return respondWithSuccess(
      res,
      promisesResolved,
      "Your items have been updated"
    );
  }
});

exports.vendorSearchOrders = asyncHandler(async (req, res) => {
  const { expressionType, filter, isInteger, searchBy, searchQuery } =
    getSearchParams(req);

  const regexFilterParam = {
    // query contains
    contains: {
      [searchBy]: new RegExp(searchQuery, "i"),
    },
    // Query starts with
    starts_with: {
      [searchBy]: new RegExp("^" + searchQuery, "i"),
    },
    // Exact query (Case sensitive)
    is: {
      [searchBy]: req.query.q,
    },
    // Exact query (Case insensitive)
    is_i: {
      [searchBy]: isInteger
        ? parseFloat(req.query.q || 0)
        : new RegExp("^" + searchQuery + "$", "i"),
    },
    // Is greater than  (Numbers)
    is_gt: {
      [searchBy]: isInteger ? { $gt: parseFloat(req.query.q) } : "",
    },
    // Is lesser than  (Numbers)
    is_lt: {
      [searchBy]: isInteger ? { $lt: parseFloat(req.query.q) } : "",
    },
  };
  const searchParams = {
    ...regexFilterParam[filter],
  };
  const vendor = req.vendor;

  //   Get all vendor's products
  const products = await Product.find({ addedBy: vendor?._id });

  //   Get all orders
  const orders = await Order.find(searchParams);

  //   Get vendor's orders from all vendor products and all orders
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
  console.log(vendorFilteredOutOrders);

  if (vendorFilteredOutOrders) {
    // Filter

    return respondWithSuccess(res, vendorFilteredOutOrders, "Fetched", 200);
  } else {
    return respondWithError(res, [], "An error occured", 400);
  }
});
