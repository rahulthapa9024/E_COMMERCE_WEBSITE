const express = require("express");
const userSync = require("../controllers/User/syncUser")
const addPhoneNo = require('../controllers/User/addPhoneNo')
const PhoneNoExist = require('../controllers/User/phoneNoExist')
const addAddress = require("../controllers/User/addAddress")
const beingDelivered = require("../controllers/User/beingDelivered")
const changeAddress = require("../controllers/User/changeAddress")
const getAddress = require("../controllers/User/getAddress")
const getPhoneNo = require("../controllers/User/getPhoneNo")
const router = express.Router();

router.post("/sync",userSync)
router.post("/addPhoneNo", addPhoneNo);
router.get("/phoneNoExist",PhoneNoExist)
router.post("/address/:emailId",addAddress);
router.get("/beingDelivered/:emailId", beingDelivered);
router.put("/changeAddress/:emailId", changeAddress);
router.get("/address/:emailId", getAddress);
router.get("/phone/:emailId", getPhoneNo);



module.exports = router