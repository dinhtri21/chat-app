const User = require("../models/user");
const Login = require("../models/login");

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
  