const User = require("../models/user");
const Group = require("../models/group");
exports.joinGroup = async (data, socket, io) => {
  try {
    socket.join(data.groupId);
    console.log(data.groupId);
  } catch (error) {
    console.log("Lỗi hàm joinGroup socket io: " + error);
  }
};

exports.createGroup = async (data, socket, io) => {
  try {
    const newGroup = await new Group({
      name: data.groupName,
      members: data.members,
    });
    console.log(newGroup);
    await newGroup.save();
    io.emit("groupCreated", newGroup);
    socket.emit("groupCreatedSuccess", newGroup);
  } catch (error) {
    console.log("Lỗi hàm createGroup" + error);
  }
};

exports.addFriend = async (data, socket, io) => {
  try {
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

exports.joinMultiMemberGroup = async (data, socket, io) => {
  try {
    const listUserId = data.listUserId;
    const groupName = data.groupName;
    console.log(listUserId);
    console.log(groupName);
    // Tạo một nhóm mới
    const newGroup = await new Group({
      name: groupName ? groupName : "Group_" + Date.now(), // Đặt tên cho nhóm theo timestamp
      members: listUserId,
    });
    await newGroup.save();
    // Cập nhật danh sách groups của tất cả các user
    for (const userId of listUserId) {
      const user = await User.findById(userId);
      if (user) {
        user.groups.push(newGroup._id);
        await user.save();
      }
    }
    // socket.emit("multiMemberGroupCreated", {
    //   status: "error",
    //   message: "Đã xảy ra lỗi khi tạo nhóm",
    // });
    socket.broadcast.emit("multiMemberGroupCreated", {
      status: "success",
      message: `Nhóm mới đã được tạo`,
      newGroup: newGroup.members,
    });

    socket.emit("joinMultiMemberGroup", {
      status: "success",
      message: `Tạo thành công!`,
    });
    console.log("Vừa tạo group: " + newGroup);
  } catch (error) {
    console.error(
      "Lỗi khi tạo nhóm và thêm thành viên vào nhóm hàm joinMultiMemberGroup: " +
        error
    );
    socket.emit("joinMultiMemberGroup", {
      status: "error",
      message: "Đã xảy ra lỗi khi tạo nhóm",
    });
  }
};
