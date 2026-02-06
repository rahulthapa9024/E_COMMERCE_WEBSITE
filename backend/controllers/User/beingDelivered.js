const CartSchema = require("../../models/cartSchema");
const Product = require("../../models/productSchema");

const BeingDelivered = async (req, res) => {
  try {
    const { emailId } = req.params;

    if (!emailId) {
      return res.status(400).json({
        success: false,
        message: "emailId is required in params"
      });
    }

    // 1️⃣ Find user cart
    const user = await CartSchema.findOne({ emailId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const beingDelivered = user.BeingDelivered || [];

    if (beingDelivered.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        beingDelivered: []
      });
    }

    // 2️⃣ Collect all unique product titles (for batch query)
    const allTitles = [
      ...new Set(
        beingDelivered.flatMap(d =>
          d.products.map(p => p.title.trim().toLowerCase())
        )
      )
    ];

    // 3️⃣ Fetch all products in ONE query
    const productsInDB = await Product.find({
      title: { $in: allTitles.map(t => new RegExp(`^${t}$`, "i")) }
    });

    const productMap = new Map(
      productsInDB.map(p => [p.title.toLowerCase(), p])
    );

    // 4️⃣ Enrich deliveries
    const enrichedDeliveries = beingDelivered.map(delivery => {
      const products = delivery.products.map(prod => {
        const productDoc = productMap.get(prod.title.toLowerCase());

        if (productDoc) {
          return {
            ...productDoc.toObject(),
            quantity: prod.quantity,
            size: prod.size || "",
            color: prod.color || ""
          };
        }

        // fallback snapshot
        return {
          title: prod.title,
          quantity: prod.quantity,
          size: prod.size || "",
          color: prod.color || "",
          image: prod.image || "",
          price: prod.price || 0
        };
      });

      return {
        ID: delivery.ID,
        products,
        price: delivery.price,
        createdAt: delivery.createdAt
      };
    });

    return res.status(200).json({
      success: true,
      count: enrichedDeliveries.length,
      beingDelivered: enrichedDeliveries
    });

  } catch (err) {
    console.error("BeingDelivered Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

module.exports = BeingDelivered;
