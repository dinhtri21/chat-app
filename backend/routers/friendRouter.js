var express = require("express");
var router = express.Router();
const { addFriend } = require("../controllers/friendController");

router.post("/friend-request", addFriend);

module.exports = router;
