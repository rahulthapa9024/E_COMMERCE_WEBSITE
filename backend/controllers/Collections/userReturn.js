const Cart = require("../../models/cartSchema");
const User = require("../../models/userModel");

const userMarkAsReturn = async (req, res) => {
  try {
    const { Pid } = req.params;
    const { emailId } = req.query;

    const {
      AccountNo,
      IFSCcode,
      AccountHolderName,
      BankName,
      UPIid,
      UserName
    } = req.body;

    if (!Pid) {
      return res.status(400).json({
        success: false,
        message: "Pid is required"
      });
    }

    if (!emailId) {
      return res.status(400).json({
        success: false,
        message: "emailId is required"
      });
    }

    // ✅ Validate refund details
    const hasBankDetails =
      AccountNo && IFSCcode && AccountHolderName && BankName;

    const hasUPIDetails = UPIid && UserName;

    if (!hasBankDetails && !hasUPIDetails) {
      return res.status(400).json({
        success: false,
        message: "Provide either full bank details or UPI details"
      });
    }

    // ✅ Fetch admin cart, user cart & user profile
    const [adminCart, userCart, userProfile] = await Promise.all([
      Cart.findOne({ emailId: process.env.GMAIL_USER }),
      Cart.findOne({ emailId }),
      User.findOne({ emailId })
    ]);

    if (!adminCart) {
      return res.status(404).json({ success: false, message: "Admin cart not found" });
    }

    if (!userCart) {
      return res.status(404).json({ success: false, message: "User cart not found" });
    }

    if (!userProfile) {
      return res.status(404).json({ success: false, message: "User profile not found" });
    }

    // ✅ Find order in pastOrders
    const userItem = userCart.pastOrders.find(
      item => item._id?.toString() === Pid || item.ID === Pid
    );

    if (!userItem) {
      return res.status(404).json({
        success: false,
        message: "Order not found in pastOrders"
      });
    }

    // Convert to plain object
    const userItemPlain =
      typeof userItem.toObject === "function"
        ? userItem.toObject()
        : { ...userItem };

    // 🗑 Remove from pastOrders & adminHistory
    userCart.pastOrders = userCart.pastOrders.filter(
      item => item.ID !== userItemPlain.ID
    );

    adminCart.adminHistory = adminCart.adminHistory.filter(
      item => item.ID !== userItemPlain.ID
    );

    // 🕒 CURRENT DATE
    const now = new Date();

    // ✅ Admin returned order (schema-aligned)
    const returnOrder = {
      emailId,
      products: userItemPlain.products.map(p => ({
        title: p.title,
        quantity: p.quantity,
        size: p.size,
        color: p.color,
        image: p.image
      })),
      price: userItemPlain.price,
      address: {
        houseNo: userProfile.address?.houseNo || "",
        landmark: userProfile.address?.landmark || "",
        streetAddress: userProfile.address?.streetAddress || "",
        city: userProfile.address?.city || "",
        state: userProfile.address?.state || "",
        postalCode: userProfile.address?.postalCode || ""
      },
      phoneNo: userProfile.phoneNo || "",
      displayName: userProfile.displayName || "",
      orderDate: now.toISOString(), // ✅ STRING as per schema
      ID: userItemPlain.ID
    };

    // ✅ Attach refund details
    if (hasBankDetails) {
      Object.assign(returnOrder, {
        AccountNo,
        IFSCcode,
        AccountHolderName,
        BankName
      });
    }

    if (hasUPIDetails) {
      Object.assign(returnOrder, {
        UPIid,
        UserName
      });
    }

    // ➕ Push to adminreturnedCart
    adminCart.adminreturnedCart.push(returnOrder);

    // ➕ Push to user BeingReturned
    userCart.BeingReturned.push({
      products: returnOrder.products,
      price: userItemPlain.price,
      createdAt: now, // ✅ Date field
      ID: userItemPlain.ID
    });

    await Promise.all([
      adminCart.save(),
      userCart.save()
    ]);

    return res.status(200).json({
      success: true,
      message: "Order moved to return flow successfully",
      returnedAt: now
    });

  } catch (err) {
    console.error("userMarkAsReturn error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = userMarkAsReturn;
