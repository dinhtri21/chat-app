var express = require("express");
var router = express.Router();
const { getMessages } = require("../controllers/messagesController");

router.get("/getMessages/:senderId/:recepientId", getMessages);
module.exports = router;
