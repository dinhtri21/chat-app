const message = require("../models/message");

exports.getMessages = async (req, res) => {
  try {
    const { senderId, recepientId } = req.params;

    const messages = await message
      .find({
        $or: [
          { senderId: senderId, recepientId: recepientId },
          { senderId: recepientId, recepientId: senderId },
        ],
      })
      .sort({ timeStamp: 1 }); // Sắp xếp theo thời gian tăng dần
    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Server error" });
  }
};
