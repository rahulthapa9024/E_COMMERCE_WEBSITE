const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    unique:true,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
    enum:["men","women","both"]
  },
  price: {
    type: Number,
    required: true,
  },
  size: {
    type: [String],
    required: true,
    enum:["S","M","L","XL","XXL","XXXL"]
  },
  colors: {
    type: [String],
    required: true,
  },
  image: {
    type: [String],
    required: true,
  },
  inStock: {
    type: Boolean,
    required: true,
  }
}, {
  timestamps: true,
});

const Product = mongoose.model("Product",productSchema)
 
module.exports = Product;
