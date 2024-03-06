var express = require("express");
var router = express.Router();
const { addFriend, getListFriendRequests, getListSentFriendRequests } = require("../controllers/friendController");


router.post("/friend-request", addFriend);
router.get("/getListFriendRequest/:userId", getListFriendRequests);
router.get("/getListSentFriendRequests/:userId", getListSentFriendRequests);

module.exports = router;
