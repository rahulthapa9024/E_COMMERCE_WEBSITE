const User = require("../../models/userModel");

const addPhoneNo = async (req, res) => {
  try {
    const { emailId, phoneNo } = req.body;

    if (!emailId || !phoneNo) {
      return res.status(400).json({
        success: false,
        message: "emailId and phoneNo are required",
      });
    }

    // UPDATED REGEX: Allows optional '+' at the start
    const phoneRegex = /^\+?[0-9]{10,15}$/; 
    if (!phoneRegex.test(phoneNo)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format (must be 10-15 digits with optional +)",
      });
    }

    // Using findOneAndUpdate is faster and returns the updated doc
    const user = await User.findOneAndUpdate(
      { emailId },
      { phoneNo: phoneNo },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Phone number updated successfully",
      phoneNo: user.phoneNo,
    });
  } catch (err) {
    console.error("Error in addPhoneNo:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = addPhoneNo;