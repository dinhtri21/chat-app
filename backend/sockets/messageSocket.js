const Message = require("../models/message");
const Group = require("../models/group");
const User = require("../models/user");
const path = require("path");
const fs = require("fs");

const saveBase64Image = (base64String, mimeType) => {
  try {
    let type = mimeType.split("/");
    const fileName = `${(new Date().getTime() / 1000) | 0}.${type[1]}`;
    const imagePath = path.join(__dirname, "../uploads/") + fileName;
    fs.writeFileSync(imagePath, base64String, { encoding: "base64" });
    return fileName; // Trả về tên file đã lưu
  } catch (error) {
    console.error("Error saving base64 image:", error);
  }
};

// Hàm tạo mới tin nhắn //
const createNewMessage = async (data, imageUrl) => {
  const { senderId, recepientId, messageType, message, timeStamp } = data;
  const newMessage = new Message({
    senderId,
    recepientId,
    messageType,
    message,
    imageUrl,
    timeStamp,
  });
  await newMessage.save();
  return newMessage.toJSON();
};

exports.sendMessage = async (data, socket, io) => {
  try {
    const { imageBase64, mimeType, ...messageData } = data;
    let imageUrl = "";
    if (imageBase64) {
      imageUrl = await saveBase64Image(imageBase64, mimeType);
    }
    // Tạo mới tin nhắn
    const newMessageJSON = await createNewMessage(messageData, imageUrl);

    // Tìm nhóm
    const commonGroup = await Group.findOne({
      members: { $all: [messageData.senderId, messageData.recepientId] },
    });

    if (!commonGroup) {
      // Tìm thông tin user gửi yêu cầu kết bạn
      const sender = await User.findById(messageData.senderId);
      if (!sender) {
        throw new Error("User not found");
      }
      // Tìm thông tin user nhận yêu cầu kết bạn
      const receiver = await User.findById(messageData.recepientId);
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
      newMessageJSON.imageUrl = `${process.env.IMG_URL}/${newMessageJSON.imageUrl}`; // Thêm host cho ảnh
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
