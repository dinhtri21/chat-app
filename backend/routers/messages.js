var express = require("express");
var router = express.Router();
const {
  getMessages,
  getLatestMessage,
} = require("../controllers/messagesController");

router.get("/getMessages/:senderId/:groupId", getMessages);
router.get("/getLatestMessage/:groupId", getLatestMessage);

module.exports = router;
