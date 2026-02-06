const Cart = require("../../models/cartSchema");

const getUserBeingReturnedOrders = async (req, res) => {
  try {
    const { emailId } = req.query;

    if (!emailId) {
      return res.status(400).json({
        success: false,
        message: "emailId is required"
      });
    }

    // Fetch user cart
    const userCart = await Cart.findOne({ emailId });
    if (!userCart) {
      return res.status(404).json({
        success: false,
        message: "User cart not found"
      });
    }

    const beingReturned = userCart.BeingReturned || [];

    // Return BeingReturned orders
    return res.status(200).json({
      success: true,
      count: beingReturned.length,
      BeingReturned: beingReturned
    });

  } catch (err) {
    console.error("getUserBeingReturnedOrders error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = getUserBeingReturnedOrders;
