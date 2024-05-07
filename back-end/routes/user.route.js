const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "hi there",
  });
});

module.exports = router;
