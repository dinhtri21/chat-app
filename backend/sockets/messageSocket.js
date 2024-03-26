const Message = require("../models/message");
const Group = require("../models/group");
const User = require("../models/user");

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
    if (!commonGroup) {
      // Tìm thông tin user gửi yêu cầu kết bạn
      const sender = await User.findById(senderId);
      if (!sender) {
        throw new Error("User not found");
      }
      // Tìm thông tin user nhận yêu cầu kết bạn
      const receiver = await User.findById(recepientId);
      if (!receiver) {
        throw new Error("Selected user not found");
      }
      // Tạo nhóm mới và thêm người dùng và bạn bè vào nhóm đó
      const newGroup = await Group.create({
        name: "Group_" + sender._id + "_" + receiver._id,
        members: [sender._id, receiver._id],
      });
      sender.groups.push(newGroup._id);
      receiver.groups.push(newGroup._id);
      await sender.save();
      await receiver.save();

      socket.join(newGroup._id.toString());
      io.to(newGroup._id.toString()).emit("newMessage", {
        message: newMessageJSON,
      });
    } else {
      socket.join(commonGroup._id.toString());
      io.to(commonGroup._id.toString()).emit("newMessage", {
        message: newMessageJSON,
      });
    }
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn:", error);
    // Trả về thông báo lỗi cho người gửi tin nhắn
    socket.emit("messageError", { error: "Đã có lỗi xảy ra khi gửi tin nhắn" });
  }
};
