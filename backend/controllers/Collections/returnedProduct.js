const Cart = require("../../models/cartSchema");

const processSingleReturn = async (req, res) => {
  try {
    const { ID, emailId } = req.body;
    const adminEmail = process.env.GMAIL_USER;

    if (!ID || !emailId) {
      return res.status(400).json({
        success: false,
        message: "Order ID and emailId are required"
      });
    }

    // 1️⃣ Fetch admin & user carts
    const [adminCart, userCart] = await Promise.all([
      Cart.findOne({ emailId: adminEmail }),
      Cart.findOne({ emailId })
    ]);

    if (!adminCart) {
      return res.status(404).json({ success: false, message: "Admin cart not found" });
    }

    if (!userCart) {
      return res.status(404).json({ success: false, message: "User cart not found" });
    }

    // 2️⃣ Find order in adminreturnedCart
    const adminIndex = adminCart.adminreturnedCart.findIndex(
      item => item.ID === ID && item.emailId === emailId
    );

    if (adminIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Order not found in adminreturnedCart"
      });
    }

    const adminItem = adminCart.adminreturnedCart[adminIndex];

    // 🕒 CURRENT DATE (single source of truth)
    const now = new Date();

    // 3️⃣ Move adminreturnedCart → adminReturnedCart
    adminCart.adminReturnedCart.push({
      emailId: adminItem.emailId,
      products: adminItem.products.map(p => ({
        title: p.title,
        quantity: p.quantity,
        size: p.size,
        color: p.color,
        image: p.image
      })),
      price: adminItem.price,
      address: {
        houseNo: adminItem.address?.houseNo || "",
        landmark: adminItem.address?.landmark || "",
        streetAddress: adminItem.address?.streetAddress || "",
        city: adminItem.address?.city || "",
        state: adminItem.address?.state || "",
        postalCode: adminItem.address?.postalCode || ""
      },
      phoneNo: adminItem.phoneNo || "",
      displayName: adminItem.displayName || "",
      orderDate: now.toISOString(), // ✅ LATEST DATE
      ID: adminItem.ID,

      // Payment details
      AccountNo: adminItem.AccountNo || null,
      IFSCcode: adminItem.IFSCcode || "",
      AccountHolderName: adminItem.AccountHolderName || "",
      BankName: adminItem.BankName || "",
      UPIid: adminItem.UPIid || "",
      UserName: adminItem.UserName || ""
    });

    // Remove from adminreturnedCart
    adminCart.adminreturnedCart.splice(adminIndex, 1);

    // 4️⃣ Find order in user's BeingReturned
    const userIndex = userCart.BeingReturned.findIndex(
      item => item.ID === ID
    );

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Order not found in user's BeingReturned"
      });
    }

    const userItem = userCart.BeingReturned[userIndex];

    // 5️⃣ Move BeingReturned → UserReturned
    userCart.UserReturned.push({
      products: userItem.products.map(p => ({
        title: p.title,
        quantity: p.quantity,
        size: p.size,
        color: p.color,
        image: p.image
      })),
      price: userItem.price,
      createdAt: now, // ✅ LATEST DATE
      ID: userItem.ID
    });

    // Remove from BeingReturned
    userCart.BeingReturned.splice(userIndex, 1);

    // 6️⃣ Save both documents
    await Promise.all([
      adminCart.save(),
      userCart.save()
    ]);

    return res.status(200).json({
      success: true,
      message: `Order ${ID} processed successfully`,
      processedAt: now
    });

  } catch (err) {
    console.error("processSingleReturn error:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = processSingleReturn;
