const mongoose = require("../db");

const userStatusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  socketId: {
    type: String,
  },
  lastLoginTime: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["online", "offline"],
    default: "offline",
  },
});

const userStatus = mongoose.model("userStatus", userStatusSchema);

module.exports = userStatus;
