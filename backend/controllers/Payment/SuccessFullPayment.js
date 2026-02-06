const Razorpay = require("razorpay");
const crypto = require("crypto");
const CartSchema = require("../../models/cartSchema");
const Product = require("../../models/productSchema");
const User = require("../../models/userModel");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/* ================= HELPER: CALCULATE TOTAL ================= */
const calculateCartTotal = async (emailId) => {
  const cart = await CartSchema.findOne({ emailId });
  if (!cart || !cart.cart.length) return { total: 0, cart: null };

  const titles = cart.cart.map(i => i.title.trim());
  const products = await Product.find({ title: { $in: titles } }).collation({ locale: 'en', strength: 2 });

  let total = 0;
  cart.cart.forEach(item => {
    const product = products.find(p => p.title.toLowerCase() === item.title.toLowerCase());
    if (product) total += product.price * item.quantity;
  });

  return { total, cart, products };
};

/* ================= CREATE ORDER ================= */
exports.createOrder = async (req, res) => {
  try {
    const { emailId } = req.body;
    const { total } = await calculateCartTotal(emailId);

    if (!total) return res.status(400).json({ message: "Cart empty" });

    const order = await razorpay.orders.create({
      amount: total * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= VERIFY PAYMENT ================= */
exports.verifyAndProcessPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, emailId } = req.body;

    // 1. Signature check
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // 2. Data check
    const { total, cart, products } = await calculateCartTotal(emailId);
    const user = await User.findOne({ emailId });
    if (!cart || !user) return res.status(404).json({ success: false, message: "User/Cart not found" });

    // 3. Prevent Duplicates
    const isDuplicate = await CartSchema.findOne({ "BeingDelivered.paymentId": razorpay_payment_id });
    if (isDuplicate) return res.status(400).json({ success: false, message: "Already processed" });

    // 4. Process Order
    const sharedID = crypto.randomBytes(4).toString("hex").toUpperCase();
    const orderItems = cart.cart.map(item => {
      const p = products.find(pr => pr.title.toLowerCase() === item.title.toLowerCase());
      return { 
        title: item.title, 
        quantity: item.quantity, 
        size: item.size || "N/A", 
        image: p?.image?.[0] || "" 
      };
    });

    // Save to User's deliveries
    cart.BeingDelivered.push({
      ID: sharedID,
      products: orderItems,
      price: total,
      paymentId: razorpay_payment_id,
      createdAt: new Date()
    });
    cart.cart = []; 
    await cart.save();

    // Save to Admin
    const admin = await CartSchema.findOne({ emailId: process.env.GMAIL_USER });
    if (admin) {
      admin.adminCart.push({
        ID: sharedID,
        emailId,
        products: orderItems,
        price: total,
        phoneNo: user.phoneNo,
        displayName: user.displayName,
        address: user.address,
        orderDate: new Date()
      });
      await admin.save();
    }

    res.json({ success: true, orderID: sharedID });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};