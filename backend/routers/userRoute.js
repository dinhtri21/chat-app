var express = require("express");
var router = express.Router();
const { registerUser } = require("../controllers/userController");
const { loginUser } = require("../controllers/userController");
const authMiddleware = require("../authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/check-token", authMiddleware, (req, res) => {
  res.status(200).json({ message: "Token hợp lệ!" });
});

router.get("/abc", (req, res) => {
  res.send("hello");
});

module.exports = router;
