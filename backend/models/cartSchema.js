const mongoose = require("mongoose");


const cartSchema = new mongoose.Schema({
  emailId: {
    type: String,
    unique: true,
    required: true
  },
  favourites: {
    type: [String],
    default: []
  },
  cart: {
    type: [{
      title: String,
      quantity: { type: Number, default: 1 },
      color: String,
      size: String
    }],
    default: []
  },
BeingDelivered: {
    type: [
      {
        products: [
          {
            title: String,
            quantity: { type: Number, default: 1 },
            size: String,
            color: String,
            image: String
          }
        ],
        price: Number,
        createdAt: { type: Date, default: Date.now },
        ID: String // ✅ Do NOT use default here!
      }
    ],
    default: []
  },
BeingReturned: {
    type: [
      {
        products: [
          {
            title: String,
            quantity: { type: Number, default: 1 },
            size: String,
            color: String,
            image: String
          }
        ],
        price: Number,
        createdAt: { type: Date, default: Date.now },
        ID: String, // ✅ Do NOT use default he
      }
    ],
    default: []
  },
rejectedOrder: {
    type: [
      {
        products: [
          {
            title: String,
            quantity: { type: Number, default: 1 },
            size: String,
            color: String,
            image: String
          }
        ],
        price: Number,
        createdAt: { type: Date, default: Date.now },
        ID: String // ✅ Do NOT use default here!
      }
    ],
    default: []
  },
pastOrders: {
    type: [
      {
        products: [
          {
            title: String,
            quantity: { type: Number, default: 1 },
            size: String,
            color: String,
            image: String
          }
        ],
        price: Number,
        createdAt: { type: Date, default: Date.now },
        ID: String
      }
    ],
    default: []
  },
adminCart: {
    type: [
      {
        emailId: String,
        products: [
          {
            title: String,
            quantity: { type: Number, default: 1 },
            size: String,
            color: String,
            image: String
          }
        ],
        price: Number,
        address: {
          houseNo: String,
          landmark: String,
          streetAddress: String,
          city: String,
          state: String,
          postalCode: String
        },
        phoneNo: String,
        displayName: String,
        orderDate: String,
        ID: String
      }
    ],
    default: []
  }, 
adminreturnedCart: {
    type: [
      {
        emailId: String,
        products: [
          {
            title: String,
            quantity: { type: Number, default: 1 },
            size: String,
            color: String,
            image: String
          }
        ],
        price: Number,
        address: {
          houseNo: String,
          landmark: String,
          streetAddress: String,
          city: String,
          state: String,
          postalCode: String
        },
        phoneNo: String,
        displayName: String,
        orderDate: String,
        ID: String,
        dateString:String,
        AccountNo:Number,
        IFSCcode:String,
        AccountHolderName:String,
        BankName:String,
        UPIid:String,
        UserName:String
      }
    ],
    default: []
  },
adminHistory: {
    type: [
      {
        emailId: String,
        products: [
          {
            title: String,
            quantity: { type: Number, default: 1 },
            size: String,
            color: String,
            image: String
          }
        ],
        price: Number,
        address: {
          houseNo: String,
          landmark: String,
          streetAddress: String,
          city: String,
          state: String,
          postalCode: String
        },
        phoneNo: String,
        displayName: String,
        orderDate: String,
        ID: String
      }
    ],
    default: []
  },  
adminRejected: {
    type: [
      {
        emailId: String,
        products: [
          {
            title: String,
            quantity: { type: Number, default: 1 },
            size: String,
            color: String,
            image: String
          }
        ],
        price: Number,
        address: {
          houseNo: String,
          landmark: String,
          streetAddress: String,
          city: String,
          state: String,
          postalCode: String
        },
        phoneNo: String,
        displayName: String,
        orderDate: String,
        ID: String
      }
    ],
    default: []
  },
adminReturnedCart: {
    type: [
      {
        emailId: String,
        products: [
          {
            title: String,
            quantity: { type: Number, default: 1 },
            size: String,
            color: String,
            image: String
          }
        ],
        price: Number,
        address: {
          houseNo: String,
          landmark: String,
          streetAddress: String,
          city: String,
          state: String,
          postalCode: String
        },
        phoneNo: String,
        displayName: String,
        orderDate: String,
        ID: String,
        AccountNo:Number,
        IFSCcode:String,
        AccountHolderName:String,
        BankName:String,
        UPIid:String,
        UserName:String
      }
    ],
    default: []
  },
UserReturned: {
    type: [
      {
        products: [
          {
            title: String,
            quantity: { type: Number, default: 1 },
            size: String,
            color: String,
            image: String
          }
        ],
        price: Number,
        createdAt: { type: Date, default: Date.now },
        ID: String // ✅ Do NOT use default here!
      }
    ],
    default: []
  }
},
{
  timestamps: true,
  collection: "collections"
});


const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;