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
exports.getLatestMessage = async (req, res) => {
  try {
    const { userId, recepientId } = req.params;
    const latestMessage = await message
      .findOne({
        $or: [
          { $and: [{ senderId: userId }, { recepientId: recepientId }] },
          { $and: [{ senderId: recepientId }, { recepientId: userId }] },
        ],
      })
      .sort({ timeStamp: -1 });

    console.log("run" + userId + recepientId);
    res.status(200).json({ message: latestMessage });
  } catch (error) {
    console.error("Lỗi khi lấy tin nhắn mới nhất:", error);
    res
      .status(500)
      .json({ error: "Đã có lỗi xảy ra khi lấy tin nhắn mới nhất" });
  }
};
