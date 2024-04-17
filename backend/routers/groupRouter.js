var express = require("express");
var router = express.Router();
const { getAllGroup, getMultiMemberGroup } = require("../controllers/groupController");

router.get("/getAllGroup/:userId", getAllGroup);
router.get("/getMultiMemberGroup/:userId", getMultiMemberGroup);

module.exports = router;
