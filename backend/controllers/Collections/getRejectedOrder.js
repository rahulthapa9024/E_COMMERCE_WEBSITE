const Cart = require("../../models/cartSchema");

const getRejectedOrder = async (req, res) => {
  try {
    const { emailId } = req.query;
    if (!emailId) {
      return res.status(400).json({ success: false, message: "emailId is required" });
    }

    const limit = 40;
    const page = parseInt(req.query.page, 10) || 1;
    const skip = (page - 1) * limit;

    // Admin case
    if (emailId === process.env.GMAIL_USER) {
      const adminCart = await Cart.findOne({ emailId });
      if (!adminCart) {
        return res.status(404).json({ success: false, message: "Admin cart not found" });
      }

      const total = adminCart.adminRejected.length;
      const pagedData = adminCart.adminRejected.slice(skip, skip + limit);

      return res.json({
        success: true,
        totalItems: total,
        page,
        totalPages: Math.ceil(total / limit),
        count: pagedData.length,
        adminRejected: pagedData,
      });
    }

    // User case
    const userCart = await Cart.findOne({ emailId });
    if (!userCart) {
      return res.status(404).json({ success: false, message: "User cart not found" });
    }

    const total = userCart.rejectedOrder.length;
    const pagedData = userCart.rejectedOrder.slice(skip, skip + limit);

    return res.json({
      success: true,
      totalItems: total,
      page,
      totalPages: Math.ceil(total / limit),
      count: pagedData.length,
      rejectedOrder: pagedData,
    });
  } catch (err) {
    console.error("Get Rejected Orders Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = getRejectedOrder;
