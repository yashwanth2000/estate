const express = require("express");
const router = express.Router();
const { updateUser, deleteUser } = require("../controller/user.controller");
const verifyToken = require("../utils/verifyUser");

router.post("/update/:id", verifyToken, updateUser)
router.delete("/delete/:id", verifyToken, deleteUser)
module.exports = router;
