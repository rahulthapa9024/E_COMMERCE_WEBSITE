const CartSchema = require("../../models/cartSchema");

const DeleteFromCart = async (req, res) => {
  try {
    const { emailId } = req.query;

    if (!emailId) {
      return res.status(400).json({
        success: false,
        message: "emailId is required",
      });
    }

    const { product, removeCompletely = false } = req.body;

    if (!product?.title) {
      return res.status(400).json({
        success: false,
        message: "Product title is required",
      });
    }

    // Find cart
    const userCart = await CartSchema.findOne({ emailId });

    if (!userCart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const existingItem = userCart.cart.find(
      (item) => item.title === product.title
    );

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    // Decide operation
    const update =
      removeCompletely || existingItem.quantity <= 1
        ? { $pull: { cart: { title: product.title } } }
        : { $inc: { "cart.$[elem].quantity": -1 } };

    const options = {
      new: true,
      arrayFilters:
        !removeCompletely && existingItem.quantity > 1
          ? [{ "elem.title": product.title }]
          : undefined,
    };

    const updatedCart = await CartSchema.findOneAndUpdate(
      { emailId },
      update,
      options
    );

    return res.status(200).json({
      success: true,
      message:
        removeCompletely || existingItem.quantity <= 1
          ? "Product removed from cart"
          : "Product quantity decreased",
      cart: updatedCart.cart,
    });
  } catch (err) {
    console.error("DeleteFromCart Error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = DeleteFromCart;
