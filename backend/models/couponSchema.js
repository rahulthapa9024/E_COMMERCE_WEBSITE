const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    coupon: {
        code: { type: String, required: true },
        value: { type: String },
        name: { type: String }
    },
    usedUsers: [
        {
            emailId: { type: String },
            usedCode: { type: [String] }
        }
    ]
}, { timestamps: true });

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
