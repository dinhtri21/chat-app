var express = require("express");
var router = express.Router();
const { getAllGroup, getMultiMemberGroup, getDataUsersInGroup } = require("../controllers/groupController");

router.get("/getAllGroup/:userId", getAllGroup);
router.get("/getMultiMemberGroup/:userId", getMultiMemberGroup);
router.get("/getDataUsersInGroup/:groupId", getDataUsersInGroup);


module.exports = router;
