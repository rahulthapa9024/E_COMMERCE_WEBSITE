const CartSchema = require("../../models/cartSchema");

const favourites = async (req, res) => {
  try {
    const { emailId } = req.query;

    if (!emailId) {
      return res.status(400).json({
        success: false,
        message: "emailId is required",
      });
    }

    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Product title is required",
      });
    }

    // Find or create cart
    let userCart = await CartSchema.findOne({ emailId });

    if (!userCart) {
      userCart = await CartSchema.create({
        emailId,
        favourites: [],
        cart: [],
        Order: [],
      });
    }

    // Prevent duplicates
    if (userCart.favourites.includes(title)) {
      return res.status(200).json({
        success: true,
        message: "Product already in favourites",
        favourites: userCart.favourites,
      });
    }

    userCart.favourites.push(title);
    await userCart.save();

    return res.status(200).json({
      success: true,
      message: "Product added to favourites",
      favourites: userCart.favourites,
    });

  } catch (err) {
    console.error("Favourites Error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { favourites };
