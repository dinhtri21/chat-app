var express = require("express");
var router = express.Router();
const userController = require("../controllers/userController");

router.post("/register", userController.registerUser);

module.exports = router;
