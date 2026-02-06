const Cart = require("../../models/cartSchema");

const getAdminHistory = async (req, res) => {
  try {
    // ✅ Admin email from ENV or decoded JWT (preferred)
    const adminEmail = process.env.GMAIL_USER;

    const page = parseInt(req.query.page) || 1;
    const limit = 50;

    const adminCart = await Cart.findOne({ emailId: adminEmail });

    if (!adminCart) {
      return res.status(404).json({
        success: false,
        message: "Admin cart not found",
      });
    }

    const history = adminCart.adminHistory || [];
    const totalCount = history.length;

    const startIndex = (page - 1) * limit;
    const pagedHistory = history.slice(startIndex, startIndex + limit);

    res.status(200).json({
      success: true,
      adminHistory: pagedHistory,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
      },
    });
  } catch (error) {
    console.error("getAdminHistory error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = getAdminHistory;
