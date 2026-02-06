const User = require("../../models/userModel");
const Product = require("../../models/productSchema");

const updateProduct = async (req, res) => {
  try {
    const { emailId } = req.query;

    if (!emailId) {
      return res.status(400).json({
        success: false,
        message: "emailId is required"
      });
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const {
      title,
      newTitle,
      description,
      category,
      price,
      discount,
      size,
      colors,
      image,
      inStock
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Product title is required"
      });
    }

    const product = await Product.findOne({ title });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // 🔐 Prevent duplicate title
    if (newTitle && newTitle !== title) {
      const existing = await Product.findOne({ title: newTitle.trim() });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Another product with this title already exists"
        });
      }
      product.title = newTitle.trim();
    }

    // ✅ Update only provided fields
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;

    if (price !== undefined) {
      if (typeof price !== "number" || price < 0) {
        return res.status(400).json({ success: false, message: "Invalid price" });
      }
      product.price = price;
    }

    if (discount !== undefined) {
      if (typeof discount !== "number" || discount < 0) {
        return res.status(400).json({ success: false, message: "Invalid discount" });
      }
      product.discount = discount;
    }

    if (size !== undefined) {
      if (!Array.isArray(size) || size.length === 0) {
        return res.status(400).json({ success: false, message: "Invalid size array" });
      }
      product.size = size;
    }

    if (colors !== undefined) {
      if (!Array.isArray(colors) || colors.length === 0) {
        return res.status(400).json({ success: false, message: "Invalid colors array" });
      }
      product.colors = colors;
    }

    if (image !== undefined) {
      if (!Array.isArray(image) || image.length === 0) {
        return res.status(400).json({ success: false, message: "Invalid image array" });
      }
      product.image = image;
    }

    if (inStock !== undefined) {
      if (typeof inStock !== "boolean") {
        return res.status(400).json({ success: false, message: "Invalid inStock value" });
      }
      product.inStock = inStock;
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product
    });

  } catch (err) {
    console.error("Update Product Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = { updateProduct };
