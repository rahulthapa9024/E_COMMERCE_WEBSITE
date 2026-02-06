const productSchema = require("../../models/productSchema");

const fetchAllMenProducts = async (req, res) => {
  try {
    // Find products with category "men" or "both"
    const allProducts = await productSchema.find({
      category: { $in: ["men", "both"] }
    });

    res.status(200).json({
      success: true,
      products: allProducts,
      totalProducts: allProducts.length
    });

  } catch (err) {
    console.error("Fetch All Men Products Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch men products",
      error: err.message
    });
  }
};

module.exports = fetchAllMenProducts;
