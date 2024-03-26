var logger = require("morgan");
const express = require("express");
require("dotenv").config(); //biến môi trường
const userRouter = require("./routers/userRoute");
const friendRouter = require("./routers/friendRouter");
const messages = require("./routers/messages");
const group = require("./routers/groupRouter")
const cors = require("cors");
const app = express();
//socket io
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const { addFriend, acceptFriend } = require("./sockets/friendSocket");
const { login } = require("./sockets/userSocket");
const { sendMessage } = require("./sockets/messageSocket");
// addFriend(io);

io.on("connection", (socket) => {
  console.log("a user connected.");
  socket.on("login", (data) => {
    login(data, socket);
  });
  socket.on("friendRequest", (data) => {
    addFriend(data, socket, io);
  });
  socket.on("sendMessage", (data) => {
    sendMessage(data, socket, io);
  });
  socket.on("acceptFriend", (data) => {
    acceptFriend(data, socket, io);
  });
  socket.on("disconnect", async () => {
    console.log("user disconnected");
    
  });
});

// Middleware logging
app.use(logger("dev"));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//router
app.use("/user", userRouter);
app.use("/friend", friendRouter);
app.use("/messages", messages);
app.use("/group", group);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // send error as JSON response
  res.status(err.status || 500).json({ error: err.message });
});

// app.listen(process.env.PORT, () => {
//   console.log(`Example app listening on port ${process.env.PORT}`);
// });

server.listen(process.env.PORT, () => {
  console.log("listening on *:3001");
});
