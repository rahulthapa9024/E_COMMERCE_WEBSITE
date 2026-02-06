const CartSchema = require("../../models/cartSchema");

const RemoveFromCart = async (req, res) => {
  try {
    const { emailId } = req.query;
    const { product } = req.body;

    if (!emailId) {
      return res.status(400).json({
        success: false,
        message: "emailId is required",
      });
    }

    if (!product?.title) {
      return res.status(400).json({
        success: false,
        message: "Product title is required",
      });
    }

    const userCart = await CartSchema.findOne({ emailId });

    if (!userCart) {
      return res.status(200).json({
        success: true,
        cart: [],
      });
    }

    const cartItem = userCart.cart.find(
      (item) => item.title === product.title
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    const update =
      cartItem.quantity > 1
        ? { $inc: { "cart.$.quantity": -1 } }
        : { $pull: { cart: { title: product.title } } };

    const updatedCart = await CartSchema.findOneAndUpdate(
      { emailId, "cart.title": product.title },
      update,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message:
        cartItem.quantity > 1
          ? "Product quantity decreased"
          : "Product removed from cart",
      cart: updatedCart.cart,
    });
  } catch (err) {
    console.error("RemoveFromCart Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to update cart",
    });
  }
};

module.exports = RemoveFromCart;
