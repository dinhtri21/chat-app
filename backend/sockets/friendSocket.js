const User = require("../models/user");
const Group = require("../models/group");
exports.joinGroup = async (data, socket, io) => {
  try {
    socket.join(data.groupId);
  } catch (error) {
    console.log("Lỗi hàm joinGroup socket io: " + error);
  }
};
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

    const commonGroup = await Group.findOne({
      members: { $all: [sender, receiver] },
    });
    if (!commonGroup) {
      // Tạo một document mới và lưu nó trực tiếp vào CSDL thay vì new phải dùng save
      const newGroup = await Group.create({
        name: "Group_" + sender._id + "_" + receiver._id,
        members: [sender._id, receiver._id],
      });
      sender.groups.push(newGroup._id);
      receiver.groups.push(newGroup._id);
      await sender.save();
      await receiver.save();

      socket.join(newGroup._id.toString());
      io.to(newGroup._id.toString()).emit("addFriendStatus", {
        success: true,
        groupId: newGroup._id.toString(),
        senderId: sender._id,
        receiverId: receiver._id,
      });
      io.emit("addFriendStatus", {
        sender: sender._id,
        success: true,
        groupId: newGroup._id.toString(),
        senderId: sender._id,

        receiverId: receiver._id,
      });
    } else {
      socket.join(commonGroup._id.toString());
      io.to(commonGroup._id.toString()).emit("addFriendStatus", {
        success: true,
      });
    }
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
    const acceptor = await User.findById(data.acceptorId);
    if (!acceptor) {
      throw new Error("Không tìm thấy người chấp nhật yêu cầu kết bạn!");
    }

    // Tìm thông tin user gửi yêu cầu kết bạn
    const sender = await User.findById(data.senderId);
    if (!sender) {
      throw new Error("Không tìm thấy người gửi yêu cầu kết bạn!");
    }

    // Kiểm tra xem đã tồn tại bạn từ trước
    const existingFriends = await acceptor.friends.find((request) =>
      request.equals(sender._id)
    );
    if (existingFriends) {
      throw new Error("Đã là bạn!");
    }
    const existingFriends1 = await sender.friends.find((request) =>
      request.equals(acceptor._id)
    );
    if (existingFriends1) {
      throw new Error("Đã là bạn!");
    }

    // Cập nhật danh sách bạn bè của cả hai người dùng
    acceptor.friends.push(sender._id);
    sender.friends.push(acceptor._id);

    // Loại bỏ yêu cầu kết bạn khỏi danh sách
    acceptor.friendRequests = acceptor.friendRequests.filter(
      (request) => request.toString() !== sender._id.toString()
    );
    sender.sentFriendRequests = sender.sentFriendRequests.filter(
      (request) => request.toString() !== acceptor._id.toString()
    );

    // Lưu các thay đổi vào csdl
    await acceptor.save();
    await sender.save();

    // Tìm group chung giữa acceptor và sender
    const commonGroup = await Group.findOne({
      members: { $all: [acceptor._id, sender._id] },
    });

    // Gửi emit cho các thành viên trong group
    if (commonGroup) {
      io.to(commonGroup._id.toString()).emit("friendRequestAccepted", {
        status: "success",
        message: `Chấp nhận kết bạn thành công`,
      });
    }
  } catch (error) {
    console.error("Lỗi hàm acceptFriend socket io: " + error);
  }
};
