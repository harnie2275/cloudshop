const vendor_url =
  process.env.NODE_ENV === "development"
    ? "localhost:3000"
    : "https://cloud-vendor.vercel.app";

// https://www.vendor.cloudshopa.com

module.exports = vendor_url;
