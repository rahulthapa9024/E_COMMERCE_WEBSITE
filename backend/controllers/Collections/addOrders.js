const CartSchema = require("../../models/cartSchema");

const orders = async (req, res) => {
  try {
    const { emailId } = req.query;

    if (!emailId) {
      return res.status(400).json({
        success: false,
        message: "emailId is required"
      });
    }

    const { product } = req.body;
    if (
      !product ||
      !product.title ||
      !product.price ||
      !product.quantity
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product data"
      });
    }

    // 1️⃣ Find cart
    const userCart = await CartSchema.findOne({ emailId });
    if (!userCart) {
      return res.status(404).json({
        success: false,
        message: "User cart not found"
      });
    }

    // 2️⃣ Create order snapshot
    const orderItem = {
      title: product.title,
      price: product.price,
      quantity: product.quantity,
      color: product.color || null,
      size: product.size || null,
      orderedAt: new Date()
    };

    // 3️⃣ Push to orders
    userCart.orders.push(orderItem);

    // 4️⃣ OPTIONAL: clear cart after order
    // userCart.cart = [];

    await userCart.save();

    return res.status(200).json({
      success: true,
      message: "Order placed successfully",
      orders: userCart.orders
    });

  } catch (err) {
    console.error("Orders Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = orders ;
