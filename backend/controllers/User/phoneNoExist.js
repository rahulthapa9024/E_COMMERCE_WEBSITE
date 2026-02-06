const User = require("../../models/userModel");

const PhoneNoExist = async (req, res) => {
  try {
    const { emailId } = req.query; // ✅ from frontend

    if (!emailId) {
      return res.status(400).json({
        success: false,
        message: "emailId is required",
      });
    }

    const user = await User.findOne({ emailId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const exists = Boolean(user.phoneNo);

    return res.status(200).json({
      success: true,
      exists,
    });
  } catch (err) {
    console.error("Error in PhoneNoExist:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = PhoneNoExist;
