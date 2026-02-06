const Product = require("../../models/productSchema");
const Cart = require("../../models/cartSchema");

const deleteProduct = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || typeof title !== "string") {
      return res.status(400).json({
        success: false,
        message: "Valid product title is required"
      });
    }

    // ✅ Check product exists
    const product = await Product.findOne({ title });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // ✅ Remove ONLY from cart & favourites
    const cartUpdateResult = await Cart.updateMany(
      {},
      {
        $pull: {
          favourites: title,
          cart: { title }
        }
      }
    );

    // ✅ Delete product itself
    await Product.deleteOne({ title });

    return res.status(200).json({
      success: true,
      message: "Product deleted and removed from carts & favourites",
      deletedProduct: product,
      cartsMatched: cartUpdateResult.matchedCount,
      cartsUpdated: cartUpdateResult.modifiedCount
    });

  } catch (err) {
    console.error("Delete Product Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = { deleteProduct };
