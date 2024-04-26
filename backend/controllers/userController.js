const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");

const saveBase64Image = (imageBase64, mimeType) => {
  try {
    let type = mimeType.split("/");
    const fileName = `${(new Date().getTime() / 1000) | 0}.${type[1]}`;
    const imagePath = path.join(__dirname, "../uploads/avatar/") + fileName;
    fs.writeFileSync(imagePath, imageBase64, { encoding: "base64" });
    return fileName; // Trả về tên file đã lưu
  } catch (error) {
    console.error("Error saving base64 image:", error);
  }
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, imageBase64, mimeType } = req.body;
    let imageUrl = "";
    if (imageBase64) {
      imageUrl = await saveBase64Image(imageBase64, mimeType);
    }
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Cần điền đầy đủ thông tin!" });
    }
    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);
    // Tạo User
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      image: imageUrl,
    });
    await newUser.save();

    res.status(200).json({ message: "Đăng ký người dùng thành công!" });
  } catch (err) {
    // Trường hợp trùng lặp email
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email === 1) {
      console.log("Email đã tồn tại trong cơ sở dữ liệu");
      return res.status(400).json({ message: "Email này đã được dùng!" });
    }
    console.log("Lỗi hàm registerUser", err);
    res.status(500).json({ message: "Đăng ký người dùng thất bại!" });
  }
};
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Cần có email và mật khẩu!" });
    }
    //Tìm người dùng trong database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại!" });
    }
    //So sánh mật khẩu sau khi lấy user lên
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch == false) {
      return res.status(401).json({ message: "Mật khẩu không chính xác!" });
    }

    // Nếu mọi thứ đều chính xác, trả về phản hồi thành công và tạo token
    const token = createToken(user._id);
    return res.status(200).json({ message: "Đăng nhập thành công!", token });
  } catch (err) {
    console.error("Error logging in user", err);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi đăng nhập!" });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId)
      .populate({
        path: "groups",
        populate: { path: "members", select: "name email image" },
      })
      .lean();

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    const userGroups = await user.groups;

    // Danh sách các id bị loại
    const excludedUserIds = [
      ...user.friends,
      ...user.friendRequests,
      ...user.sentFriendRequests,
      userId,
    ];

    const usersData = await User.find({
      _id: { $nin: excludedUserIds },
    })
      .lean()
      .select("name email image");

    const result = usersData.map((userData) => {
      const isInGroup = userGroups.filter((group) =>
        group.members.some((member) => {
          return userData._id.equals(member._id) && group.members.length <= 2;
        })
      );

      if (isInGroup.length > 0) {
        isInGroup[0].members.forEach((member) => {
          member.image = `${process.env.IMG_URL}/avatar/${member.image}`;
        });
        return isInGroup[0];
      } else {
        const userDataWithImage = {
          ...userData,
          image: userData.image
            ? `${process.env.IMG_URL}/avatar/${userData.image}`
            : null,
        };
        return userDataWithImage;
      }
    });
    res.status(200).json(result);
  } catch (err) {
    console.log("Lỗi hàm getAllUsers: " + err);
    res.status(500).json({ message: "Lỗi truy xuất người dùng" });
  }
};
exports.getUserByID = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (user.image) {
      user.image = `${process.env.IMG_URL}/avatar/${user.image}`;
    }
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy người dùng!" });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error("Lỗi tìm kiếm getUserByID :", err);
    res.status(500).json({ error: "Server error" });
  }
};
const createToken = (userId) => {
  const payload = {
    userId: userId,
  };
  const token = jwt.sign(payload, "your_secret_key", { expiresIn: "1h" });
  return token;
};
