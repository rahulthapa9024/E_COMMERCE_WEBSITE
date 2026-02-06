const Cart = require("../../models/cartSchema");

const getAdminReturnedCart = async (req, res) => {
  try {
    const adminEmail = process.env.GMAIL_USER;

    if (!adminEmail) {
      return res.status(500).json({
        success: false,
        message: "Admin email not configured"
      });
    }

    // Pagination
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 40, 1);
    const skip = (page - 1) * limit;

    // Fetch admin cart
    const adminCart = await Cart.findOne({ emailId: adminEmail });

    if (!adminCart) {
      return res.status(404).json({
        success: false,
        message: "Admin cart not found"
      });
    }

    // ✅ SAFE fallback
    const returned = adminCart.adminReturnedCart || [];
    const total = returned.length;

    const pagedData = returned.slice(skip, skip + limit);

    return res.status(200).json({
      success: true,
      totalItems: total,
      page,
      totalPages: Math.ceil(total / limit),
      count: pagedData.length,
      adminReturnedCart: pagedData
    });

  } catch (err) {
    console.error("getAdminReturnedCart error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = getAdminReturnedCart;
