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
        .select("name members")
        .lean();
      return {
        group: groupWithMembers.name,
        members: groupWithMembers.members,
      };
    });

    const groupMembers = await Promise.all(groupMembersPromises);

    const groupMembersAddHostImage = await groupMembers.map((group) => {
      const addHostImage = group.members.map((member) => {
        return { ...member, image: `${process.env.IMG_URL}/avatar/${member.image}` };
      });
      return { ...group, members: addHostImage };
    });

    res.status(200).json(groupMembersAddHostImage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
