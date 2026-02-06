const express = require("express");
const paymentRouter = express.Router();

const AdminUserOrders = require("../controllers/Payment/AdminuserOrders");
const productDelivered = require("../controllers/Payment/productDelivered");
const getAdminHistory = require("../controllers/Payment/getAdminHistory");
const getUserHistory = require("../controllers/Payment/getUserHistory");
const { createOrder, verifyAndProcessPayment } = require("../controllers/Payment/SuccessFullPayment");

// Orders
paymentRouter.get("/adminUserOrders/:page", AdminUserOrders);
paymentRouter.patch("/productDelivered/:Pid/:userEmail", productDelivered);

// ✅ Clean & consistent
paymentRouter.get("/getAdminHistory", getAdminHistory);
paymentRouter.get("/getUserHistory/:emailId", getUserHistory);

// Razorpay
paymentRouter.post("/createOrder", createOrder);
paymentRouter.post("/verifyPayment", verifyAndProcessPayment);

module.exports = paymentRouter;
