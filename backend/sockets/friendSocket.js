const User = require("../models/user");
const Login = require("../models/login");
exports.addFriend = async (data, socket, io) => {
  try {
    console.log(
      `Người gửi${data.currentUserId} và người nhận ${data.selectedUserId}`
    );

    // Tìm thông tin user gửi yêu cầu kết bạn
    const currentUser = await User.findById(data.currentUserId);
    if (!currentUser) {
      throw new Error("User not found");
    }

    // Tìm thông tin user nhận yêu cầu kết bạn
    const selectedUser = await User.findById(data.selectedUserId);
    if (!selectedUser) {
      throw new Error("Selected user not found");
    }
    //Cập nhật csdl
    await User.findByIdAndUpdate(data.selectedUserId, {
      $push: { friendRequests: data.currentUserId },
    });

    //Gửi thông báo cho người nhận cập nhật sent
    const currentSocketUserId = await Login.findOne({
      userId: data.currentUserId,
    });
    io.to(currentSocketUserId.socketId).emit("friendRequestReceived", {
      message: "Gửi kết bạn thành công!",
    });

    // Kiểm tra xem đã tồn tại yêu cầu kết bạn từ trước
    const existingRequest = currentUser.sentFriendRequests.find(
      (request) => request.toString() == data.selectedUserId
    );
    if (existingRequest) {
      throw new Error("Friend request already sent");
    }

    // Tạo yêu cầu kết bạn mới
    currentUser.sentFriendRequests.push(data.selectedUserId);
    await currentUser.save();

    // Gửi thông báo cho người nhận yêu cầu kết bạn
    const selectedSocketId = await Login.findOne({
      userId: data.selectedUserId,
    });

    if (selectedSocketId) {
      io.to(selectedSocketId.socketId).emit("friendRequestReceived", {
        message: `Người dùng ${currentUser.name} đã gửi lời mời kết bạn!`,
      });
    }
  } catch (error) {
    console.error(error);
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
    const currentSocketId = await Login.findOne({ userId: data.currentUserId });
    const selectedSocketId = await Login.findOne({
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
