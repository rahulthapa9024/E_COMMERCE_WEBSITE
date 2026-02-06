const User = require("../../models/userModel");
const Product = require("../../models/productSchema");

const addProduct = async (req, res) => {
  try {
    const { emailId } = req.query;

    if (!emailId) {
      return res.status(400).json({
        success: false,
        message: "emailId is required",
      });
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ DEFAULT inStock = false
    const {
      title,
      description,
      category,
      price,
      size,
      colors,
      image,
      inStock = false,
    } = req.body;

    // ✅ Validation (UPDATED)
    if (
      !title ||
      !description ||
      !category ||
      typeof price !== "number" ||
      price < 0 ||
      !Array.isArray(size) ||
      size.length === 0 ||
      !Array.isArray(colors) ||
      colors.length === 0 ||
      !Array.isArray(image) ||
      image.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing fields",
      });
    }

    const cleanTitle = title.trim();

    const exist = await Product.findOne({ title: cleanTitle });
    if (exist) {
      return res.status(409).json({
        success: false,
        message: "Product already exists",
      });
    }

    const newProduct = await Product.create({
      title: cleanTitle,
      description,
      category,
      price,
      size,
      colors,
      image,
      inStock, // ✅ will be false if not sent
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (err) {
    console.error("Add Product Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = addProduct;
