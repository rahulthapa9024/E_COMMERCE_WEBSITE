const Coupon = require("../../models/couponSchema");

const deleteCoupon = async (req, res) => {
  try {
    const { code } = req.body;  // coupon code from request body

    if (!code) {
      return res.status(400).json({ success: false, message: "Coupon code is required in request body" });
    }

    const deleted = await Coupon.findOneAndDelete({ "coupon.code": code });
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    return res.json({ success: true, message: `Coupon with code ${code} deleted successfully` });
    
  } catch (err) {
    console.error("deleteCoupon error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = deleteCoupon;
