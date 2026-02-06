const User = require("../../models/userModel");

const getAddress = async (req, res) => {
  try {
    // 1️⃣ Get emailId from params
    const { emailId } = req.params;

    if (!emailId) {
      return res.status(400).json({
        success: false,
        message: "emailId is required in params"
      });
    }

    // 2️⃣ Fetch only address
    const user = await User.findOne({ emailId }).select("address");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // 3️⃣ Return address (empty object if not set)
    return res.status(200).json({
      success: true,
      address: user.address || {}
    });

  } catch (err) {
    console.error("Get Address Error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

module.exports = getAddress;
