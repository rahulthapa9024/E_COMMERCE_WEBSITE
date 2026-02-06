const Coupon = require("../../models/couponSchema");

// POST /coupon/add/:emailId
const addCoupon = async (req, res) => {
  try {
    // 1️⃣ Get emailId from params
    const { emailId } = req.params;

    if (!emailId) {
      return res.status(400).json({
        success: false,
        message: "emailId is required in params"
      });
    }

    // 2️⃣ Restrict to admin only
    if (emailId !== process.env.GMAIL_USER) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You cannot add coupons"
      });
    }

    // 3️⃣ Validate coupon data
    const { code, value, name } = req.body;

    if (!code || !value || !name) {
      return res.status(400).json({
        success: false,
        message: "All fields (code, value, name) are required"
      });
    }

    // 4️⃣ Check duplicate coupon
    const existingCoupon = await Coupon.findOne({
      "coupon.code": code
    });

    if (existingCoupon) {
      return res.status(409).json({
        success: false,
        message: "Coupon code already exists"
      });
    }

    // 5️⃣ Save coupon
    const coupon = new Coupon({
      coupon: { code, value, name },
      usedUsers: []
    });

    await coupon.save();

    return res.status(201).json({
      success: true,
      message: "Coupon added successfully",
      coupon
    });

  } catch (err) {
    console.error("Add Coupon Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

module.exports = addCoupon;
