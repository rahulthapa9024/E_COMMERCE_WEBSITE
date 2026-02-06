const Cart = require("../../models/cartSchema");

const getUserRejectedOrders = async (req, res) => {
  try {
    const { emailId } = req.query;

    if (!emailId) {
      return res.status(400).json({
        success: false,
        message: "emailId is required"
      });
    }

    const userCart = await Cart.findOne({ emailId });
    if (!userCart) {
      return res.status(404).json({
        success: false,
        message: "User cart not found"
      });
    }

    const rejectedOrder = userCart.rejectedOrder || [];

    return res.status(200).json({
      success: true,
      count: rejectedOrder.length,
      rejectedOrder
    });

  } catch (err) {
    console.error("getUserRejectedOrders error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = getUserRejectedOrders;
