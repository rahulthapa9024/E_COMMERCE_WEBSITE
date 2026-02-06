const Coupon = require("../../models/couponSchema");

// POST /coupon/use/:emailId
const addUsedUser = async (req, res) => {
  try {
    // 1️⃣ Get emailId from params
    const { emailId } = req.params;
    if (!emailId) {
      return res.status(400).json({
        success: false,
        message: "emailId is required in params"
      });
    }

    // 2️⃣ Get coupon code from body
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required"
      });
    }

    // 3️⃣ Find coupon
    const coupon = await Coupon.findOne({
      "coupon.code": code
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found"
      });
    }

    // 4️⃣ Check if user already exists
    const userIndex = coupon.usedUsers.findIndex(
      user => user.emailId === emailId
    );

    if (userIndex !== -1) {
      // User exists → check code
      if (coupon.usedUsers[userIndex].usedCode.includes(code)) {
        return res.status(400).json({
          success: false,
          message: "Coupon code already used by this user"
        });
      }

      coupon.usedUsers[userIndex].usedCode.push(code);
    } else {
      // New user
      coupon.usedUsers.push({
        emailId,
        usedCode: [code]
      });
    }

    await coupon.save();

    return res.status(200).json({
      success: true,
      message: "Coupon marked as used",
      usedUsers: coupon.usedUsers
    });

  } catch (err) {
    console.error("Add Used User Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

module.exports = addUsedUser;
