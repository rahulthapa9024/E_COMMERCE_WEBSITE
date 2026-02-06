const Cart = require("../../models/cartSchema");

const getUserHistory = async (req, res) => {
  try {
    // ✅ Correct param extraction
    const { emailId } = req.params;

    if (!emailId) {
      return res.status(400).json({
        success: false,
        message: "emailId is required"
      });
    }

    // Fetch cart
    const userCart = await Cart.findOne({ emailId });

    if (!userCart || !Array.isArray(userCart.pastOrders)) {
      return res.status(404).json({
        success: false,
        message: "No delivery history found for this user"
      });
    }

    // Return past orders
    return res.status(200).json({
      success: true,
      data: userCart.pastOrders
    });

  } catch (error) {
    console.error("getAdminHistory error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = getUserHistory;
