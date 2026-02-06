const CartSchema = require("../../models/cartSchema");

const removeFavourite = async (req, res) => {
  try {
    const { emailId } = req.query;
    const { title } = req.body;

    if (!emailId) {
      return res.status(400).json({
        success: false,
        message: "emailId is required",
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Product title is required",
      });
    }

    const updatedCart = await CartSchema.findOneAndUpdate(
      { emailId },
      { $pull: { favourites: title } },
      { new: true }
    );

    if (!updatedCart) {
      return res.status(200).json({
        success: true,
        favourites: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from favourites",
      favourites: updatedCart.favourites,
    });

  } catch (err) {
    console.error("Remove Favourite Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to remove favourite",
    });
  }
};

module.exports = removeFavourite;
