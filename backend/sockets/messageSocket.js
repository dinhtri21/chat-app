const Message = require("../models/message");
const userStatus = require("../models/userStatus");

exports.sendMessage = async (data, socket, io) => {
  try {
    const { senderId, recepientId, messageType, message, imageUrl } = data;

    console.log(data);
    const newMessage = new Message({
      senderId,
      recepientId,
      messageType,
      message,
      imageUrl,
    });
    const savedMessage = await newMessage.save();

    const recepientStatus = await userStatus.findOne({ userId: recepientId });
    if (!recepientStatus || recepientStatus.status === "offline") {
      console.log(
        "Người nhận đang offline, tin nhắn đã được lưu vào cơ sở dữ liệu"
      );
      // Trả về thông báo cho người gửi tin nhắn rằng tin nhắn đã được lưu thành công
      // socket.emit("messageSaved", { message: "Tin nhắn đã được lưu vào cơ sở dữ liệu", savedMessage });
      return; // Kết thúc hàm nếu người nhận đang offline
    }

    console.log(recepientStatus)
    // Gửi tin nhắn đã lưu đến người nhận thông qua socket
    io.to(recepientStatus.socketId).emit("newMessage", savedMessage);
    // Trả về thông báo cho người gửi tin nhắn rằng tin nhắn đã được gửi thành công
    io.emit("messageSent", {
      message: "Tin nhắn đã được gửi thành công",
      savedMessage,
    });
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn:", error);
    // Trả về thông báo lỗi cho người gửi tin nhắn
    socket.emit("messageError", { error: "Đã có lỗi xảy ra khi gửi tin nhắn" });
  }
};
