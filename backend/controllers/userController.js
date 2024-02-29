const User = require('../models/user');

exports.registerUser = (req, res) => {
    const { name, email, password, image } = req.body;
    const newUser = new User({ name, email, password, image });
    newUser.save()
        .then(() => {
            res.status(200).json({ message: "Đăng ký người dùng thành công!" });
        })
        .catch((err) => {
            res.status(500).json({ message: "Đăng ký người dùng thất bại!" });
        });
};