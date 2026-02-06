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

    const limit = 40;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const skip = (page - 1) * limit;

    const adminCart = await Cart.findOne({ emailId: adminEmail });
    if (!adminCart) {
      return res.status(404).json({
        success: false,
        message: "Admin cart not found"
      });
    }

    const returnedCart = adminCart.adminreturnedCart || [];
    const total = returnedCart.length;

    const pagedData = returnedCart.slice(skip, skip + limit);

    return res.status(200).json({
      success: true,
      totalItems: total,
      page,
      totalPages: Math.ceil(total / limit),
      count: pagedData.length,
      adminreturnedCart: pagedData
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
