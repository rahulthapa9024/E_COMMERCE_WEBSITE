const CartSchema = require("../../models/cartSchema");

const Cart = async (req, res) => {
  try {
    const { emailId } = req.query;
    const { product } = req.body;

    if (!emailId || !product?.title) {
      return res.status(400).json({
        success: false,
        message: "emailId and product title are required"
      });
    }

    // 1️⃣ Try increment first
    const incResult = await CartSchema.findOneAndUpdate(
      { emailId, "cart.title": product.title },
      { $inc: { "cart.$.quantity": 1 } },
      { new: true }
    );

    // 2️⃣ If product already existed → return
    if (incResult) {
      return res.status(200).json({
        success: true,
        message: "Cart updated",
        cart: incResult.cart
      });
    }

    // 3️⃣ Else → push new product
    const pushResult = await CartSchema.findOneAndUpdate(
      { emailId },
      {
        $push: {
          cart: {
            title: product.title,
            quantity: 1
          }
        }
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart: pushResult.cart
    });

  } catch (err) {
    console.error("Cart Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};

module.exports = Cart;
