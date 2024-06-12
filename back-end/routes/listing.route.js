const express = require("express");
const router = express.Router();
const { createListing, deleteListing,updateListing,getListing } = require("../controller/listing.controller");
const verifyToken = require("../utils/verifyUser");

router.post("/create", verifyToken, createListing);
router.delete("/delete/:id", verifyToken,deleteListing);
router.post("/update/:id", verifyToken,updateListing);
router.get('/get/:id', getListing);

module.exports = router;