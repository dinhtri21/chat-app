const User = require('../models/user');

exports.registerUser = (req, res) => {
    console.log(req.body);
    const { name, email, password, image } = req.body;
    const newUser = new User({ name, email, password, image });
    newUser.save()
        .then(() => {
            res.status(200).json({ message: "Đăng ký người dùng thành công!" });
        })
        .catch((err) => {
            if (err.code === 11000 && err.keyPattern && err.keyPattern.email === 1) {
                // Trường hợp trùng lặp email
                console.log("Email đã tồn tại trong cơ sở dữ liệu");
                return res.status(400).json({ message: "Email này đã được dùng!" });
            }
            console.log("Error registering user", err);
            res.status(500).json({ message: "Đăng ký người dùng thất bại!" });
        });
};