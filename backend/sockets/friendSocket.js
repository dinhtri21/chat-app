const User = require("../models/user");
const userStatus = require("../models/userStatus");
const Group = require("../models/group");
exports.addFriend = async (data, socket, io) => {
  try {
    console.log(
      `User ${data.senderId} đã gửi yêu kết bạn đến ${data.receiverId} .`
    );

    // Tìm thông tin user gửi yêu cầu kết bạn
    const sender = await User.findById(data.senderId);
    if (!sender) {
      throw new Error("User not found");
    }
    // Tìm thông tin user nhận yêu cầu kết bạn
    const receiver = await User.findById(data.receiverId);
    if (!receiver) {
      throw new Error("Selected user not found");
    }

    // Kiểm tra xem đã tồn tại yêu cầu kết bạn từ trước
    const existingRequest = await sender.sentFriendRequests.find((request) =>
      request.equals(receiver._id)
    );
    if (existingRequest) {
      throw new Error("Đã tồn tại lời gửi kết bạn!");
    }
    const existingSentRequest = await receiver.friendRequests.find((request) =>
      request.equals(sender._id)
    );
    if (existingSentRequest) {
      throw new Error("Đã tồn tại lời nhận kết bạn!");
    }

    // Nếu chưa có kết bạn từ trước thì kết bạn
    sender.sentFriendRequests.push(data.receiverId);
    await sender.save();
    receiver.friendRequests.push(data.senderId);
    await receiver.save();

    // Tạo nhóm mới và thêm người dùng và bạn bè vào nhóm đó
    const newGroup = await Group.create({
      name: "Group_" + sender._id + "_" + receiver._id,
      members: [sender._id, receiver._id],
    });
    sender.groups.push(newGroup._id);
    receiver.groups.push(newGroup._id);
    await sender.save();
    await receiver.save();

    // Thêm người dùng vào nhóm trên socket
    socket.join(newGroup._id.toString());

    // Gửi thông báo
    io.to(newGroup._id.toString()).emit("addFriendStatus", { success: true });
  } catch (error) {
    console.error("Error sending friend request:", error);
    socket.emit("addFriendStatus", {
      success: false,
    });
  }
};

exports.acceptFriend = async (data, socket, io) => {
  try {
    // Tìm thông tin user chấp nhận kết bạn
    const currentUser = await User.findById(data.currentUserId);
    if (!currentUser) {
      throw new Error("User not found");
    }

    // Tìm thông tin user gửi yêu cầu kết bạn
    const selectedUser = await User.findById(data.selectedUserId);
    if (!selectedUser) {
      throw new Error("Selected user not found");
    }

    // Cập nhật danh sách bạn bè của cả hai người dùng
    currentUser.friends.push(data.selectedUserId);
    selectedUser.friends.push(data.currentUserId);

    // Loại bỏ yêu cầu kết bạn khỏi danh sách
    currentUser.friendRequests = currentUser.friendRequests.filter(
      (request) => request.toString() !== data.selectedUserId
    );
    selectedUser.sentFriendRequests = selectedUser.sentFriendRequests.filter(
      (request) => request.toString() !== data.currentUserId
    );

    // Lưu các thay đổi vào csdl
    await currentUser.save();
    await selectedUser.save();

    // Gửi thông báo cho cả hai người dùng
    const currentSocketId = await userStatus.findOne({
      userId: data.currentUserId,
    });
    const selectedSocketId = await userStatus.findOne({
      userId: data.selectedUserId,
    });

    if (currentSocketId && selectedSocketId) {
      io.to(currentSocketId.socketId).emit("friendRequestAccepted", {
        message: `Bạn đã chấp nhận lời mời kết bạn từ ${selectedUser.name}`,
      });
      io.to(selectedSocketId.socketId).emit("friendRequestAccepted", {
        message: `${currentUser.name} đã chấp nhận lời mời kết bạn của bạn`,
      });
    }
  } catch (error) {
    console.error(error);
  }
};
