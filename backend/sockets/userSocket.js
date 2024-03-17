const User = require("../models/user");
const userStatus = require("../models/userStatus");

exports.login = async (data, socket) => {
  try {
    const userId = data.userId;
    const socketId = socket.id;
    // Kiểm tra xem thông tin đăng nhập đã tồn tại chưa
    const existingLogin = await userStatus.findOne({ userId });

    // Nếu đã tồn tại, cập nhật thông tin kết nối và status
    if (existingLogin) {
      existingLogin.socketId = socketId;
      existingLogin.lastLoginTime = Date.now();
      existingLogin.status = "online"; 
      await existingLogin.save();
    } else {
      // Nếu chưa tồn tại, tạo mới thông tin đăng nhập
      const newLogin = new userStatus({ userId, socketId, status: "online" });
      await newLogin.save();
    }

    console.log(`User ${userId} logged in with socket ${socketId}`);
    socket.emit("loginSuccess", { message: "Login successful" });
  } catch (error) {
    console.error("Error updating login info:", error);
    socket.emit("loginError", { error: "Error updating login info" });
  }
};
