const Cart = require("../../models/cartSchema");
const Product = require("../../models/productSchema");

const updateColorInCart = async (req, res) => {
  try {
    const { emailId } = req.query;
    if (!emailId) {
      return res.status(400).json({
        success: false,
        message: "emailId is required"
      });
    }

    const { title, color } = req.body;
    if (!title || !color) {
      return res.status(400).json({
        success: false,
        message: "title and color are required"
      });
    }

    // 1️⃣ Validate product & color
    const product = await Product.findOne({ title });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    if (!Array.isArray(product.colors) || !product.colors.includes(color)) {
      return res.status(400).json({
        success: false,
        message: "Invalid color for this product",
        availableColors: product.colors || []
      });
    }

    // 2️⃣ Find user's cart
    const cartDoc = await Cart.findOne({ emailId });
    if (!cartDoc) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    // 3️⃣ Find cart item
    const cartItem = cartDoc.cart.find(item => item.title === title);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart"
      });
    }

    // 4️⃣ Update only if changed
    if (cartItem.color === color) {
      return res.status(200).json({
        success: true,
        message: "Color already selected",
        cart: cartDoc.cart
      });
    }

    cartItem.color = color;
    await cartDoc.save();

    return res.status(200).json({
      success: true,
      message: "Color updated successfully",
      cart: cartDoc.cart
    });

  } catch (err) {
    console.error("updateColorInCart error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = updateColorInCart;
