const express = require("express");
const router = express.Router();
const { createListing, deleteListing } = require("../controller/listing.controller");
const verifyToken = require("../utils/verifyUser");

router.post("/create", verifyToken, createListing);
router.delete("/delete/:id", verifyToken,deleteListing);

module.exports = router;