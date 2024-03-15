const User = require("../models/user");
const Login = require("../models/login");
exports.addFriend = async (data, socket, io) => {
  try {
    // Thực hiện xử lý yêu cầu kết bạn tại đây, ví dụ: lưu vào cơ sở dữ liệu
    console.log(
      `${data.currentUserId} và ${data.selectedUserId} và ${socket.id}`
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

    // Kiểm tra xem đã tồn tại yêu cầu kết bạn từ trước
    // const existingRequest = currentUser.sentFriendRequests.find(
    //   (request) => request.toString() === data.selectedUserId
    // );
    // if (existingRequest) {
    //   throw new Error('Friend request already sent');
    // }

    // Tạo yêu cầu kết bạn mới
    currentUser.sentFriendRequests.push(data.selectedUserId);
    await currentUser.save();

    // Gửi thông báo cho người nhận yêu cầu kết bạn
    // const userId = currentUser._id;
    const selectedSocketId = await Login.findOne({
      // userId: data.selectedUserId,
      userId: data.currentUserId,
    });

    console.log(selectedSocketId);
    if (selectedSocketId) {
      io.to(selectedSocketId.socketId).emit("friendRequestReceived", {
        currentUserId: data.currentUserId,
        selectedUserId: data.selectedUserId,
      });
    }

    // io.emit("friendRequestReceived", { currentUserId, selectedUserId });
  } catch (error) {
    console.error(error);
  }
};

exports.login = async (data, socket) => {
  try {
    const userId = data.userId;
    const socketId = socket.id;
    // Kiểm tra xem thông tin đăng nhập đã tồn tại chưa
    const existingLogin = await Login.findOne({ userId });

    if (existingLogin) {
      // Nếu đã tồn tại, cập nhật thông tin kết nối
      existingLogin.socketId = socketId;
      existingLogin.lastLoginTime = Date.now();
      await existingLogin.save();
    } else {
      // Nếu chưa tồn tại, tạo mới thông tin đăng nhập
      const newLogin = new Login({ userId, socketId });
      await newLogin.save();
    }

    console.log(`User ${userId} logged in with socket ${socketId}`);
  } catch (error) {
    console.error("Error updating login info:", error);
  }
};
