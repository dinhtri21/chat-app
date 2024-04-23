const message = require("../models/message");

exports.getMessages = async (req, res) => {
  try {
    const { userId, groupId } = req.params;
    const { offset, limit } = req.query;

    const messages = await message
      .find({ groupId: groupId })
      .sort({ timeStamp: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .populate({
        path: "senderId",
        select: "name email image",
      });

    if (messages && messages.length > 0) {
      messages.forEach((message) => {
        if (message.messageType === "image") {
          message.imageUrl = `${process.env.IMG_URL}/${message.imageUrl}`;
        }
      });
      messages.forEach((message) => {
        if (
          message.senderId &&
          !message.senderId.image.includes(process.env.IMG_URL)
        ) {
          message.senderId.image = `${process.env.IMG_URL}/avatar/${message.senderId.image}`;
        }
      });
      // Sắp xếp lại dữ liệu theo thời gian tăng dần
      const sortedMessages = messages.sort(
        (a, b) => new Date(a.timeStamp) - new Date(b.timeStamp)
      );
      res.status(200).json({ messages: sortedMessages });
    } else {
      res.status(200).json({ messages: [] });
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Server error" });
  }
};
exports.getLatestMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const latestMessage = await message
      .findOne({ groupId })
      .sort({ timeStamp: -1 });

    if (latestMessage && latestMessage.messageType === "image") {
      latestMessage.imageUrl = `${process.env.IMG_URL}/${latestMessage.imageUrl}`;
    }

    res.status(200).json({ message: latestMessage || null });
  } catch (error) {
    console.error("Lỗi khi lấy tin nhắn mới nhất:", error);
    res.status(500).json({ error: "Đã có lỗi xảy ra khi lấy tin nhắn mới nhất" });
  }
};
