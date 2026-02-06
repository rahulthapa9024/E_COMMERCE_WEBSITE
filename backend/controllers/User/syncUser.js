const User = require("../../models/userModel");
const CartSchema = require("../../models/cartSchema");

// POST /auth/sync
const userSync = async (req, res) => {
  try {
    const {
      clerkId,
      emailId,
      displayName,
      photoURL,
      phoneNo,
    } = req.body;

    if (!clerkId || !emailId) {
      return res.status(400).json({
        message: "clerkId and emailId are required",
      });
    }

    // 1️⃣ Check if user already exists
    let user = await User.findOne({ clerkId });

    if (user) {
      return res.status(200).json({
        message: "User already exists",
        user,
      });
    }

    // 2️⃣ Create new user
    user = await User.create({
      clerkId,
      emailId,
      displayName,
      photoURL,
      phoneNo,
    });

    // 3️⃣ Create cart ONLY if not exists (important)
    const existingCart = await CartSchema.findOne({ emailId });

    if (!existingCart) {
      await CartSchema.create({
        emailId,
        favourites: [],
        cart: [],
        Order: [],
      });
    }

    return res.status(201).json({
      message: "User created successfully",
      user,
    });

  } catch (error) {
    console.error("Error in Clerk userSync:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = userSync;
