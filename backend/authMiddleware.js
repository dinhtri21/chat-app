const jwt = require("jsonwebtoken");

const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = await jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = decoded; // Lưu thông tin người dùng đã được xác thực vào đối tượng req
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token." });
  }
};

module.exports = authenticateToken;
