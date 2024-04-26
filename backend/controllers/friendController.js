const User = require("../models/user");
const Group = require("../models/group");

//Lấy tất cả lời mời kết bạn đã gửi
exports.getListFriendRequests = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId)
      .populate({
        path: "friendRequests",
        select: "name email",
      })
      .populate({
        path: "groups",
        populate: {
          path: "members",
          select: "name email image",
        },
      })
      .lean();
    const friendRequestsId = await user.friendRequests.map((friend) => friend._id);
    const userGroups = await user.groups;

    const commonGroups = userGroups.filter((group) => {
      const commonMembers = group.members.some((member) => {
        return friendRequestsId.some((id) => id.equals(member._id)); //Vì nó là  ObjectId chỉ có thể so sánh bằng equals
      });
      return commonMembers && group.members.length <= 2;
    });

    const groupMembersAddHostImage = await commonGroups.map((group) => {
      const addHostImage = group.members.map((member) => {
        return {
          ...member,
          image: `${process.env.IMG_URL}/avatar/${member.image}`,
        };
      });
      return { ...group, members: addHostImage };
    });
    res.status(200).json(groupMembersAddHostImage);
  } catch (err) {
    console.log("Lỗi hàm getListFriends: " + err);
    res.status(500).json({ message: "Lỗi truy xuất danh sách bạn bè" });
  }
};
//Lấy tất cả lời mời đã nhận
exports.getListSentFriendRequests = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId)
      .populate({
        path: "sentFriendRequests",
        select: "name email",
      })
      .populate({
        path: "groups",
        populate: {
          path: "members",
          select: "name email image",
        },
      })
      .lean();
    const friendRequestsId = await user.sentFriendRequests.map((friend) => friend._id);
    const userGroups = await user.groups;

    const commonGroups = userGroups.filter((group) => {
      const commonMembers = group.members.some((member) => {
        return friendRequestsId.some((id) => id.equals(member._id)); //Vì nó là  ObjectId chỉ có thể so sánh bằng equals
      });
      return commonMembers && group.members.length <= 2;
    });

    const groupMembersAddHostImage = await commonGroups.map((group) => {
      const addHostImage = group.members.map((member) => {
        return {
          ...member,
          image: `${process.env.IMG_URL}/avatar/${member.image}`,
        };
      });
      return { ...group, members: addHostImage };
    });
    res.status(200).json(groupMembersAddHostImage);
  } catch (err) {
    console.log("Lỗi hàm getListFriends: " + err);
    res.status(500).json({ message: "Lỗi truy xuất danh sách bạn bè" });
  }
};
//Lấy danh sách bạn
exports.getListFriends = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId)
      .populate({
        path: "friends",
        select: "name email",
      })
      .populate({
        path: "groups",
        populate: {
          path: "members",
          select: "name email image",
        },
      })
      .lean();
    const friendIds = await user.friends.map((friend) => friend._id);
    const userGroups = await user.groups;

    const commonGroups = userGroups.filter((group) => {
      const commonMembers = group.members.some((member) => {
        return friendIds.some((id) => id.equals(member._id)); //Vì nó là  ObjectId chỉ có thể so sánh bằng equals
      });
      return commonMembers && group.members.length <= 2;
    });

    const groupMembersAddHostImage = await commonGroups.map((group) => {
      const addHostImage = group.members.map((member) => {
        return {
          ...member,
          image: `${process.env.IMG_URL}/avatar/${member.image}`,
        };
      });
      return { ...group, members: addHostImage };
    });
    res.status(200).json(groupMembersAddHostImage);
  } catch (err) {
    console.log("Lỗi hàm getListFriends: " + err);
    res.status(500).json({ message: "Lỗi truy xuất danh sách bạn bè" });
  }
};
