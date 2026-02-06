const express = require("express");
const couponRouter = express.Router();

// Controllers
const addCoupon = require("../controllers/Discount/addCoupon");
const getCouponValue = require("../controllers/Discount/getCouponValue");
const useCoupon = require("../controllers/Discount/useCoupon");
const deleteCoupon = require("../controllers/Discount/deleteCoupon");
const getAllCoupons = require("../controllers/Discount/getAllCoupons");

// ✅ Routes (emailId from params)

// Add coupon (admin only)
couponRouter.post("/addCoupon/:emailId", addCoupon);

// Get coupon value
couponRouter.get("/getCouponValue", getCouponValue);

// Mark coupon as used
couponRouter.post("/useCoupon/:emailId", useCoupon);

// Delete coupon (admin)
couponRouter.delete("/deleteCoupon", deleteCoupon);

// Get all coupons (admin)
couponRouter.get("/getAllCoupons/:emailId", getAllCoupons);

module.exports = couponRouter;
