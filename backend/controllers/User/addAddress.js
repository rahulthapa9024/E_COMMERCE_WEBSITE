const User = require("../../models/userModel");

const addAddress = async (req, res) => {
  try {
    // 1️⃣ emailId from params
    const { emailId } = req.params;

    if (!emailId) {
      return res.status(400).json({
        success: false,
        message: "emailId is required in params"
      });
    }

    // 2️⃣ Find user
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // 3️⃣ Get address fields
    const {
      houseNo,
      landmark,
      streetAddress,
      city,
      state,
      postalCode
    } = req.body;

    // 4️⃣ Validate input
    if (
      !houseNo ||
      !landmark ||
      !streetAddress ||
      !city ||
      !state ||
      !postalCode
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required address fields"
      });
    }

    // 5️⃣ Save address
    user.address = {
      houseNo,
      landmark,
      streetAddress,
      city,
      state,
      postalCode
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address saved successfully",
      address: user.address
    });

  } catch (err) {
    console.error("Address Save Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

module.exports = addAddress
