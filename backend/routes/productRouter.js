const express = require('express');
const productRouter =  express.Router();


const fetchAllProducts = require("../controllers/Product/fetchAllProducts")
const fetchAllMenProducts = require("../controllers/Product/fetchAllMenProducts")
const {deleteProduct} = require("../controllers/Product/deleteProduct")
const getProductById = require("../controllers/Product/getProductById")
const addProduct = require("../controllers/Product/productAdd")
const getProductByTitle = require("../controllers/Product/getProductByTitle")
const{ updateProduct }= require("../controllers/Product/updateProduct")


productRouter.get("/getAllProducts",fetchAllProducts)
productRouter.get("/getAllMenProducts",fetchAllMenProducts)
productRouter.delete("/deleteProduct",deleteProduct)
productRouter.get("/getProductById/:id",getProductById)
productRouter.get("/fetchProductByTitle",getProductByTitle)
productRouter.post("/addProduct",addProduct);
productRouter.patch("/updateProduct",updateProduct)
module.exports = {productRouter}