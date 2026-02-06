const mongoose = require('mongoose');  // Add this line at the top
const Product = require('../../models/productSchema');

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format using Mongoose
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (err) {
    console.error("Get Product By ID Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: err.message,
    });
  }
};

module.exports = getProductById;