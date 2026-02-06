const Coupon = require("../../models/couponSchema");

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find(); // Fetch all coupon documents
    return res.json({
      success: true,
      coupons: coupons,
      count: coupons.length
    });
  } catch (err) {
    console.error("getCoupons error:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = getCoupons;
