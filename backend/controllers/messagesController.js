const message = require("../models/message");

exports.getMessages = async (req, res) => {
  try {
    const { senderId, recepientId } = req.params;
    const { offset, limit } = req.query;

    console.log(req.query);

    const messages = await message
      .find({
        $or: [
          { senderId: senderId, recepientId: recepientId },
          { senderId: recepientId, recepientId: senderId },
        ],
      })
      .sort({ timeStamp: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit)); // Sắp xếp theo thời gian tăng dần

    if (messages && messages.length > 0) {
      messages.forEach((message) => {
        if (message.messageType === "image") {
          message.imageUrl = `${process.env.IMG_URL}/${message.imageUrl}`;
        }
      });
      // res.status(200).json({ messages: messages });
      // Sắp xếp lại dữ liệu theo thời gian tăng dần
      const sortedMessages = messages.sort(
        (a, b) => new Date(a.timeStamp) - new Date(b.timeStamp)
      );

      // Gửi dữ liệu đã sắp xếp cho client
      res.status(200).json({ messages: sortedMessages });
    } else {
      // res.status(200).json({ messages: messages });
      // Sắp xếp lại dữ liệu theo thời gian tăng dần
      const sortedMessages = messages.sort(
        (a, b) => new Date(a.timeStamp) - new Date(b.timeStamp)
      );

      // Gửi dữ liệu đã sắp xếp cho client
      res.status(200).json({ messages: sortedMessages });
    }
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
    if (latestMessage && latestMessage.messageType == "image") {
      latestMessage.imageUrl = `${process.env.IMG_URL}/${latestMessage.imageUrl}`;
      res.status(200).json({ messages: latestMessage });
    } else if (latestMessage && latestMessage.messageType == "text") {
      res.status(200).json({ messages: latestMessage });
    } else {
      res.status(200).json({ messages: null });
    }
  } catch (error) {
    console.error("Lỗi khi lấy tin nhắn mới nhất:", error);
    res
      .status(500)
      .json({ error: "Đã có lỗi xảy ra khi lấy tin nhắn mới nhất" });
  }
};
