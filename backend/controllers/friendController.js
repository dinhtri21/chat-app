const User = require("../models/user");

//Kết bạn
exports.addFriend = async (req, res) => {
  const { currentUserId, selectedUserId } = req.body;
  try {
    //update của người nhận lời mời
    await User.findByIdAndUpdate(selectedUserId, {
      $push: { friendRequests: currentUserId },
    });
    //update của người gửi lời mời
    await User.findByIdAndUpdate(currentUserId, {
      $push: { sentFriendRequests: selectedUserId },
    });

    return res.status(200).json({ message: "Gửi lời mời thành công" });
  } catch (error) {
    console.error("Error retrieving users", err);
    res.status(200).json({ message: "Gửi lời mời thất bại" });
  }
};
//Lấy tất cả lời mời kết bạn đã gửi
exports.getListFriendRequests = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .populate("friendRequests", "name email image") //Điền các trường name email của người vào friendRequests
      .lean();

    const friendRequests = user.friendRequests;

    const friendRequestsAddHostImg = friendRequests.map((user) => {
      return { ...user, image: `${process.env.IMG_URL}/avatar/${user.image}` };
    });

    res.status(200).json(friendRequestsAddHostImg);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
//Lấy tất cả lời mời đã nhận
exports.getListSentFriendRequests = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .populate("sentFriendRequests", "name email image")
      .lean();

    const sentFriendRequests = user.sentFriendRequests;

    const sentFriendRequestsAddHost = await sentFriendRequests.map((friend) => {
      return { ...friend, image: `${process.env.IMG_URL}/avatar/${friend.image}` };
    });

    res.status(200).json(sentFriendRequestsAddHost);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Internal Server" });
  }
};
exports.getListFriends = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .populate("friends", "name email image")
      .lean();

    const friends = user.friends;

    const listFriendsAddHost = await friends.map((friend) => {
      return { ...friend, image: `${process.env.IMG_URL}/avatar/${friend.image}` };
    });

    res.json(listFriendsAddHost);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Internal Server" });
  }
};
