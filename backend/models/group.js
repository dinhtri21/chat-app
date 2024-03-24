const mongoose = require("../db");
const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
