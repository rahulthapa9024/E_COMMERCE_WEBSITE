const express = require('express');
const cartRouter = express.Router();

const Cart = require('../controllers/Collections/addCart')
const { favourites } = require("../controllers/Collections/addFavourites");
const DeleteFromCart = require("../controllers/Collections/deleteFromCart");
const getCart = require("../controllers/Collections/getCart");
const { getAllFavourites } = require("../controllers/Collections/getFavourites");
const RemoveFromCart = require("../controllers/Collections/removeCart");
const removeFavourite = require("../controllers/Collections/removeFavourite")
const getCartQuantity = require("../controllers/Collections/getCartQuantity")
const updateColorInCart = require("../controllers/Collections/addColor")
const  orders  = require("../controllers/Collections/addOrders");
const addSize = require("../controllers/Collections/addSize");
const adminreturnedCart = require("../controllers/Collections/getAdminBeingReturned")
const  getAdminReturnedCart  = require("../controllers/Collections/getAdminReturned")
const getRejectedOrder = require("../controllers/Collections/getRejectedOrder");
const userBeingReturned = require('../controllers/Collections/getUserBeingReturned')
const getUserRejectedOrders = require("../controllers/Collections/getUserRejected");
const getUserReturned = require("../controllers/Collections/getUserReturned")
const productNotDelivered = require("../controllers/Collections/markAsNotDelivered");
const rejectedOrder = require('../controllers/Collections/rejectOrder');
const returnedProduct = require("../controllers/Collections/returnedProduct")
const userMarkAsReturn = require("../controllers/Collections/userReturn");

cartRouter.post("/addInCart",Cart)
cartRouter.post("/addInFavourites", favourites);
cartRouter.delete("/deleteProductFromCart", DeleteFromCart);
cartRouter.get("/getCart", getCart);
cartRouter.get("/fetchAllFavourites", getAllFavourites);
cartRouter.delete("/removeProductFromCart", RemoveFromCart);
cartRouter.delete("/removeProductFromFavourites",removeFavourite)
cartRouter.get("/getCartQuantity/:emailId",getCartQuantity)
cartRouter.post("/addProductColor", updateColorInCart);
cartRouter.post("/addOrders", orders);
cartRouter.post("/addProductSize", addSize);
cartRouter.get("/adminReturnRequest",adminreturnedCart)
cartRouter.get("/getAdminReturnedHistory",getAdminReturnedCart)
cartRouter.get("/getRejectedOrder", getRejectedOrder);
cartRouter.get("/userBeingReturned",userBeingReturned)
cartRouter.get("/getUserRejected", getUserRejectedOrders);
cartRouter.get("/getUserReturnedHistory",getUserReturned)
cartRouter.patch("/productNotDelivered/:Pid/:userEmail", productNotDelivered);
cartRouter.post("/rejectOrder", rejectedOrder);
cartRouter.patch("/productReturnedSuccessFully",returnedProduct)
cartRouter.patch("/userMarkAsReturn/:Pid", userMarkAsReturn);

module.exports = cartRouter;