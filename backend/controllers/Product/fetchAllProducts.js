const Product = require("../../models/productSchema");

const fetchAllProducts = async (req, res) => {
  try {
    // 👉 Optional: Filter — for example, only get products that are in stock.
    const filter = {}; // Or: { inStock: true }

    // 👉 Fields projection — only what your client needs.
    const projection = {
      _id: 1,
      title: 1,
      description: 1,
      category: 1,
      price: 1,
      discount: 1,
      size: 1,
      colors: 1,
      image: 1,
      inStock: 1,
      createdAt: 1,
      updatedAt: 1,
    };

    const products = await Product
      .find(filter, projection)
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();
    console.log()
    res.status(200).json({
      success: true,
      products,
      totalProducts: products.length,
    });

  } catch (error) {
    console.error("Fetch All Products Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

module.exports = fetchAllProducts;
