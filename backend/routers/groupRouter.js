var express = require("express");
var router = express.Router();
const { getAllGroup } = require("../controllers/groupController");

router.get("/getAllGroup/:userId", getAllGroup);

module.exports = router;
