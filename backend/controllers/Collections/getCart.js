const CartSchema = require("../../models/cartSchema");

const getCart = async (req, res) => {
  try {
    const { emailId } = req.query;

    if (!emailId) {
      return res.status(400).json({
        success: false,
        message: "emailId is required",
      });
    }

    const userCart = await CartSchema.findOne({ emailId });

    return res.status(200).json({
      success: true,
      cart: userCart?.cart || [],
    });
  } catch (err) {
    console.error("GetCart Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
};

module.exports = getCart;
