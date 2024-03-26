const User = require("../models/user");
const Group = require("../models/group");
exports.getAllGroup = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).populate("groups");

    const groupMembersPromises = user.groups.map(async (group) => {
      const groupWithMembers = await Group.findById(group._id)
        .populate({
          path: "members",
          select: "name email image", // Chỉ lấy các trường name, email, image của thành viên
        })
        .select("name members");
      return {
        group: groupWithMembers.name,
        members: groupWithMembers.members,
      };
    });

    const groupMembers = await Promise.all(groupMembersPromises);

    res.status(200).json(groupMembers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
