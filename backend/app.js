var logger = require("morgan");
const express = require("express");
require("dotenv").config(); //biến môi trường
const userRouter = require("./routers/userRoute");
const friendRouter = require("./routers/friendRouter");

const cors = require("cors");
const app = express();
//socket io
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const { login } = require("./sockets/friendSocket");

// addFriend(io);
login(io);
// io.on("connection", (socket) => {
//   console.log("a user connected.");
//   socket.on("chat message", (msg) => {
//     console.log("message: " + msg);
//     io.emit("chat message", msg);
//   });
//   socket.on("disconnect", () => {
//     console.log("user disconnected");
//   });
// });

// Middleware logging
app.use(logger("dev"));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//router
app.use("/user", userRouter);
app.use("/friend", friendRouter);
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
