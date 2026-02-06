const User = require("../../models/userModel");

const getPhoneNo = async (req, res) => {
  try {
    // 1️⃣ Get emailId from params
    const { emailId } = req.params;

    if (!emailId) {
      return res.status(400).json({
        success: false,
        message: "emailId is required in params"
      });
    }

    // 2️⃣ Find user
    const user = await User.findOne({ emailId }).select("phoneNo");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      phoneNo: user.phoneNo || null,
      message: "Phone number sent successfully"
    });

  } catch (err) {
    console.error("Get Phone Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};

module.exports = getPhoneNo;
