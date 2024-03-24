const Message = require("../models/message");
const Group = require("../models/group");

exports.sendMessage = async (data, socket, io) => {
  try {
    const { senderId, recepientId, messageType, message, imageUrl } = data;

    const newMessage = new Message({
      senderId,
      recepientId,
      messageType,
      message,
      imageUrl,
    });
    await newMessage.save();
    const newMessageJSON = newMessage.toJSON();

    const commonGroup = await Group.findOne({
      members: { $all: [senderId, recepientId] },
    });

    io.to(commonGroup._id.toString()).emit("newMessage", { message: newMessageJSON });
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn:", error);
    // Trả về thông báo lỗi cho người gửi tin nhắn
    socket.emit("messageError", { error: "Đã có lỗi xảy ra khi gửi tin nhắn" });
  }
};
