const CartSchema = require("../../models/cartSchema");
const AdminUserOrders = async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1; // Use req.params.page instead of req.query.page
    const limit = 50;

    const admin = await CartSchema.findOne({ emailId: process.env.GMAIL_USER });

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const totalOrders = admin.adminCart ? admin.adminCart.length : 0;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const pagedCart = admin.adminCart ? admin.adminCart.slice(startIndex, endIndex) : [];

    res.status(200).json({
      success: true,
      adminCart: pagedCart,
      count: pagedCart.length,
      totalOrders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit)
    });
  } catch (err) {
    console.error("AdminUserOrders Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};


module.exports = AdminUserOrders;
