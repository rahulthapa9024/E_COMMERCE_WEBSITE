const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true }, 
  
  displayName: {
    type: String,
    required: true,
  },
  emailId: {
    type: String,
    required: true,
    unique: true,
  },
  photoURL: {
    type: String,
    required: true,
  },
  address: {
    houseNo: { type: String },
    landmark: { type: String },
    streetAddress: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
  },
  phoneNo: {
    type: Number,
    trim: true,
    sparse: true, // ✅ THIS FIXES YOUR ERROR!
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
