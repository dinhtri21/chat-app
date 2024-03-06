const User = require("../models/user");

exports.addFriend = async (req, res) => {
  const { currentUserId, selectedUserId } = req.body;
    
//   const jsonString = JSON.stringify(currentUserId);

  console.log(req.body);

  try {
    //update của người nhận lời mời
    await User.findByIdAndUpdate(selectedUserId, {
      $push: { friendRequests: currentUserId },
    });

    //update của người gửi lời mời
    await User.findByIdAndUpdate(currentUserId, {
      $push: { sentFriendRequests: selectedUserId },
    });

    return res.status(200).json({message: "Gửi lời mời thành công"});
  } catch (error) {
    console.error("Error retrieving users", err);
     res.status(200).json({message: "Gửi lời mời thất bại"});
  }
};
