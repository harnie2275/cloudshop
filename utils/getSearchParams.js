const getSearchParams = (req) => {
  const searchQuery = (req.query.q || "").toLowerCase();

  //   Document field to search by e.g displayName || inventory.amount
  const searchBy = req.query?.searchBy || null;

  //   Filter to apply (contains,starts_with, is_gt) etc
  const filter = req.query.filter || "";

  //   An array of value types
  const expressionType = req.query.expr ? JSON.parse(req.query.expr) : [];

  let isInteger = expressionType.some((a) => ["number", "float"].includes(a));

  return {
    searchQuery: searchQuery || "",
    searchBy: searchBy || null,
    filter: filter || "",
    expressionType: expressionType || [],
    isInteger: isInteger || false,
  };
};

module.exports = getSearchParams;
