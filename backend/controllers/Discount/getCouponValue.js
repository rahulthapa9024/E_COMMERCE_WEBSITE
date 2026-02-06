const Coupon = require("../../models/couponSchema");

// GET /coupon/value/:emailId?code=XYZ
const getCouponValue = async (req, res) => {
  try {
    const { emailId } = req.query;
    const { code } = req.query;

    // 1️⃣ Validate inputs
    if (!emailId) {
      return res.status(400).json({
        success: false,
        message: "emailId is required in params"
      });
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required as query parameter"
      });
    }

    // 2️⃣ Find coupon
    const coupon = await Coupon.findOne({ "coupon.code": code });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found"
      });
    }

    // 3️⃣ Check if user already used coupon
    const userUsed = coupon.usedUsers.find(
      user =>
        user.emailId === emailId &&
        Array.isArray(user.usedCode) &&
        user.usedCode.includes(code)
    );

    if (userUsed) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already used by this user"
      });
    }

    // 4️⃣ Return coupon value
    return res.status(200).json({
      success: true,
      coupon: {
        code: coupon.coupon.code,
        value: coupon.coupon.value,
        name: coupon.coupon.name
      }
    });

  } catch (err) {
    console.error("Get Coupon Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

module.exports = getCouponValue;
