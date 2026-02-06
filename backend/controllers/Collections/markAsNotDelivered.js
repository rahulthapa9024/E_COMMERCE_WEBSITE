const Cart = require("../../models/cartSchema");

const productNotDelivered = async (req, res) => {
  try {
    const { Pid, userEmail } = req.params;

    // Find Admin and User carts
    const adminCart = await Cart.findOne({ emailId: process.env.GMAIL_USER });
    const userCart = await Cart.findOne({ emailId: userEmail });

    if (!adminCart) {
      return res.status(404).json({ success: false, message: "Admin cart not found" });
    }
    if (!userCart) {
      return res.status(404).json({ success: false, message: "User cart not found" });
    }

    // Try to find in pastOrders by Mongo _id first, then by custom ID
    let userItem = userCart.pastOrders.find(item => item._id.toString() === Pid);
    if (!userItem) {
      userItem = userCart.pastOrders.find(item => item.ID === Pid);
    }

    if (!userItem) {
      return res.status(404).json({ success: false, message: "Past order not found for user" });
    }

    // Find in adminHistory by same custom ID
    const adminItem = adminCart.adminHistory.find(item => item.ID === userItem.ID);
    if (!adminItem) {
      return res.status(404).json({ success: false, message: "Admin history order not found" });
    }

    // Remove from adminHistory
    adminCart.adminHistory = adminCart.adminHistory.filter(item => item.ID !== userItem.ID);

    // Set current date before pushing back to adminCart and BeingDelivered
    const currentDate = new Date();
    adminItem.date = currentDate;
    userItem.date = currentDate;

    // Push back to adminCart
    adminCart.adminCart.push(adminItem);

    // Remove from pastOrders
    userCart.pastOrders = userCart.pastOrders.filter(item => item.ID !== userItem.ID);

    // Push back to BeingDelivered
    userCart.BeingDelivered.push(userItem);

    // Save to DB
    await adminCart.save();
    await userCart.save();

    return res.json({
      success: true,
      message: `Not Delivered → AdminHistory[${adminItem.ID}] moved to adminCart & PastOrders[${userItem.ID}] moved to BeingDelivered with current date`
    });

  } catch (err) {
    console.error("productNotDelivered error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = productNotDelivered;