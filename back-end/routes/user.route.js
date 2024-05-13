const express = require("express");
const router = express.Router();
const { updateUser } = require("../controller/user.controller");
const verifyToken = require("../utils/verifyUser");

router.post("/update/:id", verifyToken, updateUser)
module.exports = router;
