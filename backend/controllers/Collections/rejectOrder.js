const Cart = require("../../models/cartSchema");

const orderRejected = async (req, res) => {
  try {
    const { Pid, userEmail } = req.body;

    if (!Pid || !userEmail) {
      return res.status(400).json({
        success: false,
        message: "Pid and userEmail are required"
      });
    }

    // Fetch Admin & User carts
    const adminCart = await Cart.findOne({
      emailId: process.env.GMAIL_USER
    });

    const userCart = await Cart.findOne({
      emailId: userEmail
    });

    if (!adminCart) {
      return res.status(404).json({
        success: false,
        message: "Admin cart not found"
      });
    }

    if (!userCart) {
      return res.status(404).json({
        success: false,
        message: "User cart not found"
      });
    }

    // 🔎 Find order in BeingDelivered (support _id & custom ID)
    let userItem =
      userCart.BeingDelivered.find(
        item => item._id?.toString() === Pid
      ) ||
      userCart.BeingDelivered.find(
        item => item.ID === Pid
      );

    if (!userItem) {
      return res.status(404).json({
        success: false,
        message: "BeingDelivered order not found"
      });
    }

    // 🔎 Find matching order in adminCart
    const adminItem = adminCart.adminCart.find(
      item => item.ID === userItem.ID
    );

    if (!adminItem) {
      return res.status(404).json({
        success: false,
        message: "AdminCart order not found"
      });
    }

    // 🕒 CURRENT DATE
    const now = new Date();

    // ✅ UPDATE CORRECT FIELDS (VERY IMPORTANT)
    userItem.createdAt = now;                // rejectedOrder.createdAt
    adminItem.orderDate = now.toISOString(); // adminRejected.orderDate

    // 🗑 Remove from adminCart
    adminCart.adminCart = adminCart.adminCart.filter(
      item => item.ID !== userItem.ID
    );

    // ➕ Move to adminRejected
    adminCart.adminRejected.push(adminItem);

    // 🗑 Remove from BeingDelivered
    userCart.BeingDelivered = userCart.BeingDelivered.filter(
      item => item.ID !== userItem.ID
    );

    // ➕ Move to rejectedOrder
    userCart.rejectedOrder.push(userItem);

    // 💾 Save both documents
    await adminCart.save();
    await userCart.save();

    return res.status(200).json({
      success: true,
      message: "Order rejected successfully",
      rejectedAt: now
    });

  } catch (err) {
    console.error("Reject Order Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = orderRejected;
