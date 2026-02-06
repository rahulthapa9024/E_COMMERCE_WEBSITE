const Cart = require("../../models/cartSchema");

const productDelivered = async (req, res) => {
  try {
    const { Pid, userEmail } = req.params;

    if (!Pid || !userEmail) {
      return res.status(400).json({
        success: false,
        message: "Pid and userEmail are required"
      });
    }

    // ADMIN cart (single admin document)
    const adminCart = await Cart.findOne({
      emailId: process.env.GMAIL_USER
    });

    // USER cart
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
        (item) => item._id?.toString() === Pid
      ) ||
      userCart.BeingDelivered.find(
        (item) => item.ID === Pid
      );

    if (!userItem) {
      return res.status(404).json({
        success: false,
        message: "BeingDelivered order not found"
      });
    }

    // 🔎 Find matching order in adminCart using custom ID
    const adminItem = adminCart.adminCart.find(
      (item) => item.ID === userItem.ID
    );

    if (!adminItem) {
      return res.status(404).json({
        success: false,
        message: "AdminCart order not found"
      });
    }

    // 🕒 CURRENT DATE
    const now = new Date();

    // ✅ SET CORRECT DATE FIELDS
    userItem.createdAt = now;                // pastOrders → Date
    adminItem.orderDate = now.toISOString(); // adminHistory → String

    // 🗑 Remove from adminCart
    adminCart.adminCart = adminCart.adminCart.filter(
      (item) => item.ID !== userItem.ID
    );

    // ➕ Move to adminHistory
    adminCart.adminHistory.push(adminItem);

    // 🗑 Remove from BeingDelivered
    userCart.BeingDelivered = userCart.BeingDelivered.filter(
      (item) => item.ID !== userItem.ID
    );

    // ➕ Move to pastOrders
    userCart.pastOrders.push(userItem);

    // 💾 Save both
    await adminCart.save();
    await userCart.save();

    return res.status(200).json({
      success: true,
      message: "Order delivered successfully",
      deliveredAt: now
    });

  } catch (error) {
    console.error("productDelivered error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

module.exports = productDelivered;
