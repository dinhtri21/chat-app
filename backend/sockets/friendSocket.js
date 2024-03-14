const User = require("../models/user");
const Login = require("../models/login")
// exports.addFriend = (io) => {
//   io.on("connection", (socket) => {
//     console.log("a user connected.");

//     socket.on("sendFriendRequest", async (data) => {
//       try {
//         // Thực hiện xử lý yêu cầu kết bạn tại đây, ví dụ: lưu vào cơ sở dữ liệu

//         console.log(
//           `${data.currentUserId} và ${data.selectedUserId} và ${socket.id}`
//         );

//         // Gửi thông báo cho người nhận yêu cầu kết bạn
//         // io.emit("friendRequestReceived", { currentUserId, selectedUserId });
//       } catch (error) {
//         console.error(error);
//       }
//     });

//     socket.on("disconnect", () => {
//       console.log("user disconnected");
//     });
//   });
// };

exports.login = (io) => {
  io.on("connection", (socket) => {
    console.log("a user connected.");

    socket.on("login", async (data) => {
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
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};
