const User = require("../models/user");

exports.login = async (data, socket) => {
  try {
    const userId = data.userId;
    const socketId = socket.id;

    const user = await User.findById(userId).populate("groups");
    if (!user) {
      socket.emit("loginError", "Không tìm thấy người dùng");
      return;
    }
    //Thêm vào tất cả các nhóm thuộc về
    if (user.groups.length > 0) {
      user.groups.forEach((group) => {
        socket.join(group._id.toString());
      });
    } else {
      console.log("Người dùng chưa có nhóm");
    }

    // console.log(socket.rooms); Xem nhóm của socket đang ở
    console.log(`User ${userId} logged in with socket ${socketId}`);
    socket.emit("loginSuccess", { message: "Login successful" });
  } catch (error) {
    console.error("Error updating login info:", error);
    socket.emit("loginError", { error: "Error updating login info" });
  }
};
