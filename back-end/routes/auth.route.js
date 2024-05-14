const express = require("express");
const { signup, login,google, logout } = require("../controller/auth.controller");
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", google);
router.get("/logout", logout);

module.exports = router;
