var express = require("express");
var router = express.Router();
const { registerUser } = require("../controllers/userController");

router.post("/register", registerUser);
router.get("/abc",(req, res)=>{
    res.send("hello");
} );

module.exports = router;
