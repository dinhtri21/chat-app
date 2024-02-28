const mongoose = require("mongoose");

// Kết nối đến MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Bắt sự kiện kết nối thành công
mongoose.connect.on('connected', ()=>{
    console.log('Kết nối thành công đến MongoDB Atlas');
})
// Bắt sự kiện lỗi khi kết nối
mongoose.connection.on('error', (err) => {
    console.log('Lỗi kết nối đến MongoDB Atlas: ' + err);
});