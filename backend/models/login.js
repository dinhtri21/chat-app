const mongoose = require("../db");

const loginSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  socketId: {
    type: String,
    required: true,
  },
  lastLoginTime: {
    type: Date,
    default: Date.now,
  },
});

const Login = mongoose.model("Login", loginSchema);

module.exports = Login;