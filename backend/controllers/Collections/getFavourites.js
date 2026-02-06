const CartSchema = require("../../models/cartSchema");

const getAllFavourites = async (req, res) => {
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
      favourites: userCart?.favourites || [],
    });

  } catch (err) {
    console.error("Get Favourites Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch favourites",
    });
  }
};

module.exports = { getAllFavourites };
