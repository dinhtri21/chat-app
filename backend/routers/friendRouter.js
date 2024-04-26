var express = require("express");
var router = express.Router();
const {
  getListFriendRequests,
  getListSentFriendRequests,
  getListFriends,
} = require("../controllers/friendController");

// router.post("/friend-request", addFriend);
router.get("/listFriends/:userId", getListFriends);
router.get("/getListFriendRequest/:userId", getListFriendRequests);
router.get("/getListSentFriendRequests/:userId", getListSentFriendRequests);

module.exports = router;
