const Cart = require("../../models/cartSchema");
const Product = require("../../models/productSchema");

const addSize = async (req, res) => {
  try {
    // 1️⃣ Get emailId
    const { emailId } = req.query;
    if (!emailId) {
      return res.status(400).json({
        success: false,
        message: "emailId is required"
      });
    }

    // 2️⃣ Get body
    const { title, size } = req.body;
    if (!title || !size) {
      return res.status(400).json({
        success: false,
        message: "title and size are required"
      });
    }

    // 3️⃣ Validate product & size
    const product = await Product.findOne({ title });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    if (!Array.isArray(product.size) || !product.size.includes(size)) {
      return res.status(400).json({
        success: false,
        message: "Invalid size for product",
        availableSizes: product.size || []
      });
    }

    // 4️⃣ Find user's cart
    const cartDoc = await Cart.findOne({ emailId });
    if (!cartDoc) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    // 5️⃣ Update matching cart items
    let updatedCount = 0;

    cartDoc.cart.forEach(item => {
      if (item.title === title && item.size !== size) {
        item.size = size;
        updatedCount++;
      }
    });

    if (updatedCount === 0) {
      return res.status(200).json({
        success: true,
        message: "Size already set",
        cart: cartDoc.cart
      });
    }

    // 6️⃣ Save cart
    await cartDoc.save();

    return res.status(200).json({
      success: true,
      message: "Size updated successfully",
      updatedItems: updatedCount,
      cart: cartDoc.cart
    });

  } catch (err) {
    console.error("addSize Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = addSize;
