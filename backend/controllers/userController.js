const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, image } = req.body;

    if (!name || !email || !password || !image) {
      return res.status(400).json({ message: "Cần điền đầy đủ thông tin!" });
    }
    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);
    // Tạo User
    const newUser = new User({ name, email, password: hashedPassword, image });
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
exports.getUsers = async (req, res) => {
  const loggedInUserId = req.params.userId;

  console.log(loggedInUserId);
  User.find({ _id: { $ne: loggedInUserId } })
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.error("Error retrieving users", err);
      res.status(500).json({ message: "Lỗi truy xuất người dùng" });
    });
};
const createToken = (userId) => {
  const payload = {
    userId: userId,
  };
  const token = jwt.sign(payload, "your_secret_key", { expiresIn: "1h" });
  return token;
};
